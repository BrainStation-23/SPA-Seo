import { GetThemeFilesPaginated, UpdateThemeFiles } from "../graphql/theme.js";
import { queryDataWithVariables } from "../utils/getQueryData.js";
import { getOptimizedCss } from "../utils/purgeCssUtil.js";
import { processJsFilesWithTerser } from "../utils/terserUtil.js";

const getAllCssFilesForLiveTheme = async (res) => {
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
 * Updates the Shopify theme with purged CSS files
 * Takes the purgeCSS results and updates each file in the theme
 * @param {Object} res - Response object for GraphQL mutations
 * @param {Array<{filename: string, content: string}>} results - Results from the optimization operation
 * @param {string} themeId - ID of the theme to update
 */
const updateThemeWithOptimizedResutls = async (res, results, themeId) => {
  try {
    console.log("Starting theme update with purged CSS...");

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
    console.log("Theme update with purged CSS completed.");
  } catch (error) {
    console.error("Theme update with purged CSS failed:", error);
    throw error;
  }
};

export const optimizeTheme = async (res) => {
  try {
    console.log("Starting PurgeCSS operation...");
    const { cssFiles, liquidFiles, jsFiles, themeId, shopId } =
      await getAllCssFilesForLiveTheme(res);
    console.log(
      `Found ${cssFiles.length} CSS files, ${liquidFiles.length} Liquid files, and ${jsFiles.length} JavaScript files.`
    );
    console.log("Processing all CSS files against all Liquid and JS files...");

    const result = await getOptimizedCss(liquidFiles, jsFiles, cssFiles);
    const removeJsResult = await processJsFilesWithTerser(jsFiles);
    console.log(`PurgeCSS completed. Processed ${result.length} CSS files.`);

    // Filter results to only include files with non-zero reduction
    const bytesSavedArray = [],
      updatedThemeFiles = [];

    // Log stats and filter files with non-zero reduction
    result.forEach((item) => {
      const originalSize =
        cssFiles.find((f) => f.filename === item.file)?.content?.length || 0;
      const newSize = item.css.length;
      const reduction =
        originalSize > 0
          ? (((originalSize - newSize) / originalSize) * 100).toFixed(2)
          : 0;

      console.log(
        `${item.file}: ${reduction}% reduction (${originalSize} → ${newSize} bytes)`
      );

      // Only add to filteredResult if there's a meaningful reduction (> 0%)
      if (parseFloat(reduction) > 0) {
        // Add the original size to the item for use in updateThemeWithPurgedCSS
        updatedThemeFiles.push({ filename: item.file, content: item.css });
        bytesSavedArray.push({
          filename: item.file,
          originalSize,
          newSize,
          bytesSaved: originalSize - newSize,
          percentageReduced: parseFloat(reduction),
        });
      } else {
        console.log(`Skipping ${item.file} - no CSS reduction detected`);
      }
    });

    removeJsResult.forEach((item) => {
      const {
        actionsTakenLog,
        filename,
        finalSize,
        hasChanged,
        optimizedContent,
        originalContent,
        originalSize,
      } = item;
      const reduction =
        originalSize > 0
          ? (((originalSize - finalSize) / originalSize) * 100).toFixed(2)
          : 0;

      actionsTakenLog.forEach((str) => console.log(str));

      if (hasChanged) {
        updatedThemeFiles.push({
          filename,
          content: optimizedContent,
        });
        console.log(
          `${filename}: ${reduction}% reduction (${originalSize} → ${finalSize} bytes)`
        );
      } else {
        console.log(
          `${filename}: ${reduction}% reduction (${originalSize} → ${finalSize} bytes)\nFile skipped`
        );
      }
    });

    // Only proceed with theme update if there are files to update
    if (updatedThemeFiles.length === 0) {
      console.log("No files require updating. Theme update skipped.");
      return [];
    }

    await updateThemeWithOptimizedResutls(res, updatedThemeFiles, themeId);

    return bytesSavedArray;
  } catch (error) {
    console.error("PurgeCSS operation failed:", error);
    throw error;
  }
};
