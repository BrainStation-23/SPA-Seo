import themeService from "../services/themeService.js"; // Your version with getFilesForLiveTheme & updateThemeFilesSequentially
import htmlValidationService from "../services/htmlValidationService.js"; // Version with validateUrl
import htmlCleanerService from "../services/htmlCleanerService.js"; // Version with static config & Liquid awareness
// Removed GetMainThemeId and queryDataWithVariables if themeService.getFilesForLiveTheme provides the mainThemeId
// and we get shop domain from session for validateUrl.

/**
 * @desc Applies HTML cleanup ("Streamline Code") to ALL Liquid files of the MAIN theme.
 * After updating, it validates the store's homepage for W3C compliance.
 * Uses the static configuration within htmlCleanerService.
 * Backup is currently handled by the user's theme duplication strategy (manual or to-be-implemented service).
 * @route POST /api/html-cleaner/apply-all-streamline
 */
export const applyStreamlineCodeToLiveTheme = async (req, res) => {
  const shop = res.locals.shopify.session.shop; // Used for constructing the URL to validate and for logging
  const overallReport = {
    success: true,
    message:
      "Streamline Code processing initiated for all Liquid files in the live theme.",
    filesProcessed: 0,
    filesAttemptedToUpdate: 0,
    filesSuccessfullyUpdated: 0,
    // filesFailedValidation: 0, // This was for per-file validation, changing to page validation
    filesWithNoChange: 0,
    totalBytesSaved: 0,
    livePageValidation: null, // To store the result of the live page W3C validation
    details: [],
  };

  try {
    // htmlCleanerService uses its internal STATIC_CLEANER_CONFIG.enabled.
    // If that static config has enabled: false, cleanHtml will effectively do nothing.

    // Get all files and the main theme ID from your themeService
    const themeFilesData = await themeService.getFilesForLiveTheme(res);
    if (
      !themeFilesData ||
      !themeFilesData.themeId ||
      !themeFilesData.liquidFiles
    ) {
      throw new Error(
        "Could not retrieve file data or themeId for the MAIN theme from themeService.getFilesForLiveTheme."
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
    const filesToUpdatePayload = [];

    console.log(
      `[${shop}] Starting Streamline Code process for ${liquidFilesToProcess.length} liquid files in theme ${mainThemeId}.`
    );

    for (const file of liquidFilesToProcess) {
      const assetKey = file.filename;
      const originalHtml = file.content;
      // Initialize fileDetail with a neutral status, validationStatus is now for the page.
      const fileDetail = {
        assetKey,
        status: "Processed",
        reason: "",
        bytesSaved: 0,
      };

      try {
        if (originalHtml === null || typeof originalHtml !== "string") {
          fileDetail.status = "Skipped";
          fileDetail.reason = "Asset content was null or not a string.";
          console.warn(`[${shop}] ${fileDetail.reason} for ${assetKey}`);
          overallReport.details.push(fileDetail);
          continue;
        }

        const { cleanedHtml, report: cleanerReport } =
          await htmlCleanerService.cleanHtml(originalHtml, true); // isLiquidFile = true

        fileDetail.bytesSaved = cleanerReport.bytesSaved || 0;

        if (cleanedHtml !== originalHtml) {
          filesToUpdatePayload.push({
            filename: assetKey,
            content: cleanedHtml,
          });
          fileDetail.status = "Queued for Update"; // Will be updated in batch
          overallReport.totalBytesSaved += fileDetail.bytesSaved;
        } else {
          fileDetail.status = "No Changes Needed";
          fileDetail.reason =
            "Cleaned content is identical to original content.";
          overallReport.filesWithNoChange++;
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
        await themeService.updateThemeFilesSequentially(
          res,
          filesToUpdatePayload,
          mainThemeId
        );
        overallReport.filesSuccessfullyUpdated = filesToUpdatePayload.length;
        overallReport.details.forEach((detail) => {
          if (detail.status === "Queued for Update")
            detail.status = "Updated Successfully";
        });
        console.log(
          `[${shop}] Successfully updated ${filesToUpdatePayload.length} files.`
        );
      } catch (updateError) {
        console.error(
          `[${shop}] Error during sequential theme file update:`,
          updateError
        );
        overallReport.success = false;
        overallReport.message = `Streamline Code processing completed but with errors during file updates: ${updateError.message}`;
        overallReport.details.forEach((detail) => {
          if (detail.status === "Queued for Update") {
            detail.status = "Update Failed in Batch";
            detail.reason = updateError.message;
          }
        });
      }
    }

    // Perform W3C validation on the live homepage AFTER all changes are applied
    if (
      overallReport.filesSuccessfullyUpdated > 0 ||
      (filesToUpdatePayload.length === 0 && overallReport.filesProcessed > 0)
    ) {
      // Only validate if updates were attempted or no changes were needed (i.e., process ran)
      try {
        const storeUrl = `https://${shop}`;
        console.log(
          `[${shop}] Performing W3C validation for live URL: ${storeUrl}`
        );
        const validationReport = await htmlValidationService.validateUrl(
          storeUrl
        );
        overallReport.livePageValidation = {
          url: storeUrl,
          isValid: validationReport.isValid,
          errors: validationReport.errors,
          warnings: validationReport.warnings,
          errorMessage: validationReport.errorMessage,
        };
        if (!validationReport.isValid) {
          // You might want to flag the overall success differently if live page validation fails
          // For now, just including it in the report.
          console.warn(
            `[${shop}] Live page validation for ${storeUrl} failed.`
          );
          overallReport.message += ` Live page validation for ${storeUrl} reported ${validationReport.errors.length} errors.`;
        } else {
          overallReport.message += ` Live page validation for ${storeUrl} was successful.`;
        }
      } catch (validationError) {
        console.error(
          `[${shop}] Error during live page W3C validation:`,
          validationError
        );
        overallReport.livePageValidation = {
          url: `https://${shop}`,
          isValid: false,
          errorMessage: `Failed to perform live page validation: ${validationError.message}`,
        };
        overallReport.message += ` Live page W3C validation could not be completed.`;
      }
    }

    // Finalize overall message
    if (overallReport.filesProcessed === 0) {
      overallReport.message =
        "No Liquid files were found or targeted for processing.";
    } else if (overallReport.filesSuccessfullyUpdated > 0) {
      // Message already partially set, just confirm completion
    } else if (
      overallReport.filesAttemptedToUpdate === 0 &&
      overallReport.filesWithNoChange === overallReport.filesProcessed
    ) {
      overallReport.message = `Streamline Code processing completed. No files required changes.`;
    } else if (
      overallReport.filesProcessed > 0 &&
      filesToUpdatePayload.length === 0 &&
      overallReport.filesFailedValidation === 0
    ) {
      overallReport.message = `Streamline Code processing completed. No files required changes.`;
    } else if (!overallReport.success) {
      // Message already set by an error condition
    } else {
      overallReport.message = `Streamline Code processing completed. No files were updated. Check details.`;
    }
  } catch (error) {
    console.error(`[${shop}] Overall error applying Streamline Code:`, error);
    overallReport.success = false;
    overallReport.message =
      error.message ||
      "An unexpected error occurred during Streamline Code application.";
  }

  // Determine HTTP status based on success and if any updates actually happened
  let httpStatus = 500;
  if (overallReport.success) {
    httpStatus =
      overallReport.filesSuccessfullyUpdated > 0 ||
      overallReport.filesWithNoChange === overallReport.filesProcessed
        ? 200
        : 202; // 202 if processed but nothing changed or no updates made
  }
  if (
    overallReport.livePageValidation &&
    !overallReport.livePageValidation.isValid &&
    overallReport.livePageValidation.errors?.length > 0
  ) {
    // If live page validation failed, perhaps return a different status or ensure message reflects it
    // For now, keeping httpStatus based on file processing success primarily
  }

  return res.status(httpStatus).json(overallReport);
};
