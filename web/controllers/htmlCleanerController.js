import settingsService from "../services/settingsService.js"; //
import themeService from "../services/themeService.js"; //
import htmlValidationService from "../services/htmlValidationService.js"; //
import htmlCleanerService from "../services/htmlCleanerService.js"; // Assumed from previous step
import HtmlCleanerSettings from "../models/htmlCleanerSettingsModel.js"; // For default structure

// --- Settings Management ---
export const getStreamlineSettings = async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop;
    let settings = await settingsService.getSettings(shop); // Uses HtmlCleanerSettingsModel
    // Ensure a full settings object is returned, applying defaults if necessary
    if (!settings || !settings.hasOwnProperty("enabled")) {
      const defaultSettingsDoc = new HtmlCleanerSettings({ shopId: shop });
      settings = defaultSettingsDoc.toObject();
      delete settings._id;
      delete settings.__v;
      delete settings.createdAt;
      delete settings.updatedAt;
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error(
      `Error fetching Streamline Code settings for ${res.locals.shopify.session.shop}:`,
      error
    );
    res.status(500).json({
      success: false,
      error: "Failed to fetch settings",
      message: error.message,
    });
  }
};

export const updateStreamlineSettings = async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop;
    const settingsData = req.body; // Contains the specific rules for streamlining
    const savedSettings = await settingsService.saveSettings(
      shop,
      settingsData
    );
    res.status(200).json({
      success: true,
      message: "Streamline Code settings updated",
      settings: savedSettings,
    });
  } catch (error) {
    console.error(
      `Error updating Streamline Code settings for ${res.locals.shopify.session.shop}:`,
      error
    );
    res.status(500).json({
      success: false,
      error: "Failed to update settings",
      message: error.message,
    });
  }
};

// --- Main "Streamline Code" Action ---
/**
 * @desc Applies HTML cleanup ("Streamline Code") to ALL Liquid files of the MAIN theme using sequential updates.
 * @route POST /api/html-cleaner/apply-all-streamline
 */
export const applyStreamlineCodeToLiveTheme = async (req, res) => {
  const shop = res.locals.shopify.session.shop;
  const overallReport = {
    success: true,
    message:
      "Streamline Code processing initiated for all Liquid files in the live theme.",
    filesProcessed: 0,
    filesAttemptedToUpdate: 0,
    filesSuccessfullyUpdated: 0,
    filesFailedValidation: 0,
    totalBytesSaved: 0,
    details: [],
  };

  try {
    const settings = await settingsService.getSettings(shop);
    if (!settings.enabled) {
      overallReport.success = false;
      overallReport.message =
        "Streamline Code (HTML Cleanup) is disabled in settings. No files processed.";
      return res.status(400).json(overallReport);
    }

    const themeFilesData = await themeService.getFilesForLiveTheme(res); //
    if (
      !themeFilesData ||
      !themeFilesData.themeId ||
      !themeFilesData.liquidFiles
    ) {
      throw new Error(
        "Could not retrieve file data or themeId for the MAIN theme."
      );
    }
    const mainThemeId = themeFilesData.themeId;
    const liquidFilesToProcess = themeFilesData.liquidFiles;

    if (!liquidFilesToProcess || liquidFilesToProcess.length === 0) {
      overallReport.message =
        "No Liquid files found in the MAIN theme to process.";
      return res.status(200).json(overallReport);
    }

    overallReport.filesProcessed = liquidFilesToProcess.length;
    const filesToUpdatePayload = []; // Collect files for sequential update

    for (const file of liquidFilesToProcess) {
      const assetKey = file.filename;
      const originalHtml = file.content;
      const fileDetail = {
        assetKey,
        status: "Skipped",
        reason: "Not processed",
        bytesSaved: 0,
        validationStatus: "N/A",
      };

      try {
        console.log(`[${shop}] Processing ${assetKey} for Streamline Code...`);

        // early return
        if (originalHtml === null || typeof originalHtml !== "string") {
          fileDetail.reason = "Asset content was null or not a string.";
          console.warn(`[${shop}] ${fileDetail.reason} for ${assetKey}`);
          overallReport.details.push(fileDetail);
          continue;
        }

        // Backup part is ignored for now.

        const { cleanedHtml, report: cleanerReport } =
          await htmlCleanerService.cleanHtml(originalHtml, settings);
        const validation = await htmlValidationService.validateHtml(
          cleanedHtml,
          assetKey
        );

        fileDetail.bytesSaved = cleanerReport.bytesSaved || 0;
        fileDetail.validationStatus = validation.isValid
          ? "Valid"
          : `Invalid (${validation.errors.length} errors)`;

        if (!validation.isValid) {
          fileDetail.status = "Failed Validation";
          fileDetail.reason = `Cleaned HTML for ${assetKey} is not valid. Changes not applied.`;
          console.warn(
            `[${shop}] ${fileDetail.reason}. Errors: ${validation.errors
              .map((e) => e.message)
              .join("; ")}`
          );
          overallReport.filesFailedValidation++;
        } else {
          if (cleanedHtml !== originalHtml) {
            filesToUpdatePayload.push({
              filename: assetKey,
              content: cleanedHtml,
            });
            fileDetail.status = "Pending Update"; // Will be updated in batch
            overallReport.totalBytesSaved += fileDetail.bytesSaved;
            console.log(
              `[${shop}] ${assetKey} streamlined and validated. Queued for update.`
            );
          } else {
            fileDetail.status = "No Changes Needed";
            fileDetail.reason =
              "Cleaned content is identical to original content.";
            console.log(
              `[${shop}] ${assetKey} required no changes after streamlining.`
            );
          }
        }
      } catch (fileError) {
        console.error(
          `[${shop}] Error processing ${assetKey} for Streamline Code:`,
          fileError
        );
        fileDetail.status = "Error during processing";
        fileDetail.reason = fileError.message;
      }
      overallReport.details.push(fileDetail);
    } // end for loop

    overallReport.filesAttemptedToUpdate = filesToUpdatePayload.length;

    if (filesToUpdatePayload.length > 0) {
      try {
        console.log(
          `[${shop}] Attempting to update ${filesToUpdatePayload.length} files sequentially...`
        );
        // Using your sequential update function from themeService.js
        await themeService.updateThemeFilesSequentially(
          res,
          filesToUpdatePayload,
          mainThemeId
        ); //
        overallReport.filesSuccessfullyUpdated = filesToUpdatePayload.length; // Assume all succeed if no error from sequential update
        // Update status for files that were pending
        overallReport.details.forEach((detail) => {
          if (detail.status === "Pending Update") {
            detail.status = "Updated Successfully";
          }
        });
        console.log(
          `[${shop}] Successfully updated ${filesToUpdatePayload.length} files.`
        );
      } catch (updateError) {
        console.error(
          `[${shop}] Error during sequential theme file update:`,
          updateError
        );
        overallReport.success = false; // Mark overall as not fully successful
        overallReport.message = `Streamline Code processing completed with errors during file updates. ${updateError.message}`;
        // Update status for files that were pending but failed in batch
        overallReport.details.forEach((detail) => {
          if (detail.status === "Pending Update") {
            detail.status = "Update Failed in Batch";
            detail.reason = updateError.message;
          }
        });
      }
    }

    // Finalize overall message
    if (overallReport.filesProcessed === 0) {
      overallReport.message = "No files were targeted or found for processing.";
    } else if (overallReport.filesSuccessfullyUpdated > 0) {
      overallReport.message = `Streamline Code processing completed. ${overallReport.filesSuccessfullyUpdated} of ${overallReport.filesProcessed} Liquid file(s) updated.`;
    } else if (
      overallReport.filesFailedValidation > 0 &&
      overallReport.filesAttemptedToUpdate === 0
    ) {
      // No files were even queued for update
      overallReport.success = false;
      overallReport.message = `Streamline Code processing completed. No files were updated. ${overallReport.filesFailedValidation} file(s) failed validation.`;
    } else if (
      overallReport.filesProcessed > 0 &&
      filesToUpdatePayload.length === 0
    ) {
      // Processed files, but none needed changes or passed validation
      overallReport.message = `Streamline Code processing completed. No files required changes or passed validation for update.`;
    }
  } catch (error) {
    console.error(`[${shop}] Overall error applying Streamline Code:`, error);
    overallReport.success = false;
    overallReport.message =
      error.message ||
      "An unexpected error occurred during Streamline Code application.";
  }

  const httpStatus = overallReport.success
    ? overallReport.filesSuccessfullyUpdated > 0
      ? 200
      : 202
    : 500;
  return res.status(httpStatus).json(overallReport);
};
