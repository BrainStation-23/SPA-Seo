import {
  GetThemeFile, //
  UpdateThemeFiles,
  GetThemeFilesPaginated,
} from "../graphql/theme.js";
import { queryDataWithVariables } from "../utils/getQueryData.js"; //

/**
 * Fetches all files inside the currently live theme.\
 * @param {object} res - The Express response object.
 * @returns {Promise<{
 * shopId: string,
 * shopUrl: string,
 * themeId: string,
 * jsonFiles: Array<{filename: string, content: string}>,
 * liquidFiles: Array<{filename: string, content: string}>,
 * jsFiles: Array<{filename: string, content: string}>,
 * cssFiles: Array<{filename: string, content: string}>
 * }>} The content of the asset, or null if not found or themeId mismatch.
 */
const getFilesForLiveTheme = async (res) => {
  const cssFiles = [],
    liquidFiles = [],
    jsFiles = [],
    jsonFiles = [];
  let themeId = null,
    shopId = null,
    shopUrl = null,
    after = null,
    hasNextPage = true;

  while (hasNextPage) {
    const getThemeFileResponse = await queryDataWithVariables(
      res,
      GetThemeFilesPaginated,
      {
        count: 250,
        role: "MAIN",
        filename: ["*.css", "*.liquid", "*.js"],
        after,
      }
    );
    const theme = getThemeFileResponse.data.themes.edges[0].node;
    themeId = getThemeFileResponse.data.themes.edges[0].node.id;
    shopId = getThemeFileResponse.data.shop.id;
    const pageInfo = theme.files.pageInfo;

    theme.files.edges.map(({ node }) => {
      if (node.filename.includes(".css"))
        cssFiles.push({ filename: node.filename, content: node.body.content });
      else if (node.filename.includes(".js"))
        jsFiles.push({ filename: node.filename, content: node.body.content });
      else if (node.filename.includes(".liquid"))
        liquidFiles.push({
          filename: node.filename,
          content: node.body.content,
        });
      else if (node.filename.includes(".json")) {
        jsonFiles.push({
          filename: node.filename,
          content: node.body.content,
        });
      }
    });

    hasNextPage = pageInfo.hasNextPage;
    after = pageInfo?.endCursor;
  }

  return {
    themeId,
    shopId,
    shopUrl,
    cssFiles,
    jsFiles,
    liquidFiles,
    jsonFiles,
  };
};

/**
 * Fetches the content of a specific asset from the MAIN theme.
 * It verifies if the fetched MAIN theme's ID matches the provided currentMainThemeId.
 * @param {object} res - The Express response object.
 * @param {string} assetKey - The key of the asset (e.g., "layout/theme.liquid").
 * @returns {Promise<string|null>} The content of the asset, or null if not found or themeId mismatch.
 */
const getThemeFileByFilename = async (res, assetKey) => {
  try {
    const response = await queryDataWithVariables(res, GetThemeFile, {
      variables: {
        count: 1,
        role: "MAIN",
        filename: assetKey,
      },
    });

    if (
      response.errors ||
      (response.data &&
        response.data.userErrors &&
        response.data.userErrors.length > 0)
    ) {
      const errors = response.errors || response.data.userErrors;
      console.error(
        `GraphQL errors fetching asset ${assetKey} from MAIN theme:`,
        JSON.stringify(errors, null, 2)
      );
      const errorMessages = errors.map((e) => e.message).join(", ");
      throw new Error(
        `Failed to fetch theme asset from MAIN theme: ${errorMessages}`
      );
    }

    const themesEdges = response.data?.themes?.edges;
    if (!themesEdges || themesEdges.length === 0) {
      console.warn(
        `No MAIN theme found when trying to fetch asset ${assetKey}.`
      );
      return null;
    }

    const mainThemeNode = themesEdges[0].node;

    const filesEdges = mainThemeNode.files?.edges;
    if (!filesEdges || filesEdges.length === 0) {
      console.warn(
        `Asset ${assetKey} not found in MAIN theme (ID: ${mainThemeNode.id}).`
      );
      return null;
    }

    const assetNode = filesEdges[0].node;
    if (assetNode.body && typeof assetNode.body.content === "string") {
      return assetNode.body.content;
    } else {
      console.warn(
        `Asset ${assetKey} in MAIN theme (ID: ${mainThemeNode.id}) has null, undefined, or non-string content. Returning empty string.`
      );
      return ""; // Return empty string for null/undefined content
    }
  } catch (error) {
    console.error(
      `Service error in getThemeAsset for ${assetKey}:`,
      error.message
    );
    throw error; // Re-throw to be handled by the controller
  }
};

/**
 * Updates the content of a specific theme asset.
 * @param {object} res - The Express response object.
 * @param {string} themeIdToUpdate - The GID of the theme to update.
 * @param {string} assetKey - The key of the asset.
 * @param {string} content - The new content for the asset.
 * @returns {Promise<object>} The result of the update operation.
 */
const updateThemeAsset = async (res, themeIdToUpdate, assetKey, content) => {
  try {
    const response = await queryDataWithVariables(res, UpdateThemeFiles, {
      variables: {
        themeId: themeIdToUpdate,
        files: [
          {
            filename: assetKey,
            body: {
              type: "TEXT",
              value: content,
            },
          },
        ],
      },
    });

    if (
      response.errors ||
      response.data?.themeFilesUpsert?.userErrors?.length > 0
    ) {
      const errors =
        response.errors || response.data.themeFilesUpsert.userErrors;
      console.error(
        `Error updating theme asset ${assetKey} in theme ${themeIdToUpdate}:`,
        JSON.stringify(errors, null, 2)
      );
      const errorMessages = errors.map((e) => e.message).join(", ");
      throw new Error(`Failed to update theme asset: ${errorMessages}`);
    }
    return response.data?.themeFilesUpsert;
  } catch (error) {
    console.error(
      `Service error in updateThemeAsset for ${assetKey} (Theme ID: ${themeIdToUpdate}):`,
      error.message
    );
    throw error;
  }
};

/**
 * Updates the Shopify theme with purged CSS files
 * Takes the purgeCSS results and updates each file in the theme
 * @param {Object} res - Response object for GraphQL mutations
 * @param {Array<{filename: string, content: string}>} results - Results from the optimization operation
 * @param {string} themeId - ID of the theme to update
 */
const updateThemeFilesSequentially = async (res, results, themeId) => {
  try {
    console.log("Starting theme update ...");

    // Process each purged CSS file
    for (const result of results) {
      console.log(`Updating ${result.filename}...`);

      // Execute the theme asset update mutation
      const updateResponse = await queryDataWithVariables(
        res,
        UpdateThemeFiles,
        {
          themeId,
          files: [
            {
              filename: result.filename,
              body: {
                type: "TEXT",
                value: result.content,
              },
            },
          ],
        }
      );

      if (updateResponse.errors) {
        throw new Error(
          `Error updating ${result.filename}: ${JSON.stringify(
            updateResponse.errors
          )}`
        );
      }

      const updateResult = updateResponse.data.themeFilesUpsert;
      if (updateResult.userErrors && updateResult.userErrors.length > 0) {
        throw new Error(
          `User errors updating ${result.filename}: ${JSON.stringify(
            updateResult.userErrors
          )}`
        );
      }
      console.log(`Successfully updated ${result.filename}`);
    }
    console.log("Theme update completed.");
  } catch (error) {
    console.error("Theme update failed:", error);
    throw error;
  }
};

// /**
//  * Creates a backup of a theme asset in the specified theme.
//  * @param {object} res - The Express response object.
//  * @param {string} themeIdForBackup - The GID of the theme where the backup will be created (typically the MAIN theme's ID).
//  * @param {string} assetKey - The original asset key.
//  * @param {string} originalContent - The content of the original asset.
//  * @returns {Promise<string>} The key of the backed-up asset.
//  */
// const createAssetBackup = async (
//   res,
//   themeIdForBackup,
//   assetKey,
//   originalContent
// ) => {
//   const timestamp = new Date()
//     .toISOString()
//     .replace(/[.:TZ]/g, "-")
//     .substring(0, 19); // YYYY-MM-DD-HH-MM-SS
//   const sanitizedAssetKey = assetKey
//     .replace(/\//g, "_")
//     .replace(/\.liquid$/, "");
//   const backupAssetKey = `assets/html_cleaner_backup_${sanitizedAssetKey}_${timestamp}.liquid.txt`; // .txt to prevent rendering

//   try {
//     await updateThemeAsset(
//       res,
//       themeIdForBackup,
//       backupAssetKey,
//       originalContent
//     );
//     console.log(
//       `Backup for ${assetKey} created as ${backupAssetKey} in theme ${themeIdForBackup}`
//     );
//     return backupAssetKey;
//   } catch (error) {
//     console.error(
//       `Failed to create backup for asset ${assetKey} in theme ${themeIdForBackup}:`,
//       error
//     );
//     throw error;
//   }
// };

// /**
//  * Restores a theme asset from a specified backup asset.
//  * The backup asset is fetched from the MAIN theme (as per getThemeAsset's current implementation).
//  * The restored content is written to the assetKey in the theme specified by `themeIdForRestore`.
//  * @param {object} res - The Express response object.
//  * @param {string} mainThemeId - The GID of the current MAIN theme (used to fetch the backup).
//  * @param {string} themeIdForRestore - The GID of the theme where the asset will be restored.
//  * @param {string} assetKey - The original asset key to restore.
//  * @param {string} backupAssetKey - The key of the backup asset.
//  * @returns {Promise<object>} The result of the update operation.
//  */
// const restoreAssetFromBackup = async (
//   res,
//   mainThemeId,
//   themeIdForRestore,
//   assetKey,
//   backupAssetKey
// ) => {
//   try {
//     // Fetches backupContent from the MAIN theme, verifying against mainThemeId
//     const backupContent = await getThemeAsset(res, mainThemeId, backupAssetKey);

//     if (backupContent === null) {
//       // This implies the backupAssetKey was not found in the theme identified as 'MAIN' and matching mainThemeId.
//       throw new Error(
//         `Backup asset ${backupAssetKey} content not found in MAIN theme (ID: ${mainThemeId}). Cannot restore.`
//       );
//     }
//     // Restores the content to the specified themeIdForRestore
//     const updateResult = await updateThemeAsset(
//       res,
//       themeIdForRestore,
//       assetKey,
//       backupContent
//     );
//     console.log(
//       `${assetKey} in theme ${themeIdForRestore} restored from backup ${backupAssetKey} (source: MAIN theme ${mainThemeId})`
//     );
//     return updateResult;
//   } catch (error) {
//     console.error(
//       `Failed to restore ${assetKey} from backup ${backupAssetKey}:`,
//       error
//     );
//     throw error;
//   }
// };

export default {
  getThemeFileByFilename,
  getFilesForLiveTheme,
  updateThemeAsset,
  // createAssetBackup,
  // restoreAssetFromBackup,
};
