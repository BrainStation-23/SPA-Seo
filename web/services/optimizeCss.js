import { PurgeCSS } from "purgecss";

import { GetThemeFilesPaginated, UpdateThemeFiles } from "../graphql/theme.js";
import { queryDataWithVariables } from "../utils/getQueryData.js";

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
        filename: "*",
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
 * @param {Array} purgeCSSResults - Results from the PurgeCSS operation
 * @param {string} themeId - ID of the theme to update
 * @returns {Promise<Array>} Array of updated files with status
 */
export const updateThemeWithPurgedCSS = async (
  res,
  purgeCSSResults,
  themeId
) => {
  try {
    console.log("Starting theme update with purged CSS...");
    const updateResults = [];

    // Process each purged CSS file
    for (const result of purgeCSSResults) {
      try {
        console.log(`Updating ${result.file}...`);

        // Execute the theme asset update mutation
        const updateResponse = await queryDataWithVariables(
          res,
          UpdateThemeFiles,
          {
            themeId,
            files: [
              {
                filename: result.file,
                body: {
                  type: "TEXT",
                  value: result.css,
                },
              },
            ],
          }
        );

        if (updateResponse.errors) {
          throw new Error(
            `Error updating ${result.file}: ${JSON.stringify(
              updateResponse.errors
            )}`
          );
        }

        const updateResult = updateResponse.data.themeFilesUpsert;
        if (updateResult.userErrors && updateResult.userErrors.length > 0) {
          throw new Error(
            `User errors updating ${result.file}: ${JSON.stringify(
              updateResult.userErrors
            )}`
          );
        }

        // Calculate stats for logging
        const originalSize = result.originalSize || "unknown";
        const newSize = result.css.length;
        const reduction =
          typeof originalSize === "number" && originalSize > 0
            ? (((originalSize - newSize) / originalSize) * 100).toFixed(2)
            : "unknown";

        // Add to results
        updateResults.push({
          file: result.file,
          status: "success",
          originalSize,
          newSize,
          reduction: reduction !== "unknown" ? `${reduction}%` : reduction,
        });

        console.log(`Successfully updated ${result.file}`);
      } catch (error) {
        console.error(`Failed to update ${result.file}:`, error);
        updateResults.push({
          file: result.file,
          status: "error",
          error: error.message,
        });
      }
    }

    console.log("Theme update with purged CSS completed.");
    return updateResults;
  } catch (error) {
    console.error("Theme update with purged CSS failed:", error);
    throw error;
  }
};

/**
 * Enhanced JS extractor function that captures classes used in JavaScript
 */
const jsExtractor = (content) => {
  const selectors = new Set();

  // Match classes in common JS patterns
  let match;

  // querySelector/querySelectorAll with class selectors
  const querySelectorRegex = /querySelector(?:All)?\(['"]([^'"]+)['"]\)/g;
  while ((match = querySelectorRegex.exec(content)) !== null) {
    const selector = match[1];
    // Extract class names from selectors (handle .class-name patterns)
    const classMatches = selector.match(/\.[a-zA-Z0-9_-]+/g);
    if (classMatches) {
      classMatches.forEach((cls) => selectors.add(cls.substring(1)));
    }
  }

  // classList operations
  const classListRegex =
    /classList\.(?:add|remove|toggle|contains)\(['"]([^'"]+)['"]\)/g;
  while ((match = classListRegex.exec(content)) !== null) {
    match[1].split(" ").forEach((cls) => selectors.add(cls.trim()));
  }

  // className assignments with string literals
  const classNameRegex = /className\s*=\s*['"]([^'"]+)['"]/g;
  while ((match = classNameRegex.exec(content)) !== null) {
    match[1].split(" ").forEach((cls) => selectors.add(cls.trim()));
  }

  // class= assignments (for inline templates)
  const classAttrRegex = /class\s*=\s*['"]([^'"]+)['"]/g;
  while ((match = classAttrRegex.exec(content)) !== null) {
    match[1].split(" ").forEach((cls) => selectors.add(cls.trim()));
  }

  // Template literals for class/className
  const templateLiteralRegex = /(?:class|className)\s*=\s*`([^`]*)`/g;
  while ((match = templateLiteralRegex.exec(content)) !== null) {
    // Extract static parts from template literals
    const staticParts = match[1]
      .replace(/\${[^}]*}/g, " ")
      .split(" ")
      .filter(Boolean);
    staticParts.forEach((cls) => selectors.add(cls.trim()));
  }

  // jQuery class operations
  const jQueryClassRegex =
    /\$\([^)]*\)\.(?:addClass|removeClass|toggleClass|hasClass)\(['"]([^'"]+)['"]\)/g;
  while ((match = jQueryClassRegex.exec(content)) !== null) {
    match[1].split(" ").forEach((cls) => selectors.add(cls.trim()));
  }

  // Check for special comments that explicitly list classes to keep
  const keepClassesRegex =
    /\/\*\s*purgecss:\s*keep-classes\s*\*\/\s*(?:\/\/\s*)?(?:Classes to keep:)?\s*([^\n]*)/g;
  while ((match = keepClassesRegex.exec(content)) !== null) {
    match[1]
      .split(/\s+/)
      .filter(Boolean)
      .forEach((cls) => selectors.add(cls.trim()));
  }

  return Array.from(selectors);
};

/**
 * Enhanced liquid extractor function that handles:
 * - Regular CSS classes and IDs
 * - Classes in Liquid syntax {{ }}
 * - Dynamic classes from Liquid control flow {% %}
 * - Various HTML attribute formats
 */
const liquidExtractor = (content) => {
  // Initialize the set to store unique selectors
  const selectors = new Set();

  // Helper function to add cleaned class names to selectors
  const addClassNames = (classString) => {
    if (!classString) return;

    // Split by spaces and filter empty items
    const classNames = classString.trim().split(/\s+/).filter(Boolean);
    classNames.forEach((name) => selectors.add(name));
  };

  // Step 1: Extract regular classes from HTML attributes (both single and double quotes)
  let match;
  const classRegex = /class=["']([^"']+)["']/g;
  while ((match = classRegex.exec(content)) !== null) {
    addClassNames(match[1]);
  }

  // Step 2: Extract IDs from HTML attributes
  const idRegex = /id=["']([^"']+)["']/g;
  while ((match = idRegex.exec(content)) !== null) {
    selectors.add(`#${match[1].trim()}`);
  }

  // Step 3: Handle classes in quotes within Liquid syntax
  // This will match class names in patterns like: class="{{ something }}" or class="fixed {{ variable }} block"
  const liquidClassRegex = /class=["']([^"']*\{\{[^}]+\}\}[^"']*)["']/g;
  while ((match = liquidClassRegex.exec(content)) !== null) {
    // Extract static parts (before, between, and after Liquid tags)
    const parts = match[1].split(/\{\{[^}]+\}\}/);
    parts.forEach((part) => addClassNames(part));

    // Try to extract potential class names from Liquid tags
    const liquidParts = match[1].match(/\{\{([^}]+)\}\}/g) || [];
    liquidParts.forEach((liquidPart) => {
      // Clean up the liquid part
      const cleaned = liquidPart
        .replace(/\{\{\s*|\s*\}\}/g, "")
        .replace(/\|.*$/, "") // Remove filters
        .trim();

      // Handle common Liquid patterns that might contain class names
      if (cleaned.includes("class")) {
        // For complex expressions, we keep the whole thing to be safe
        selectors.add(cleaned);
      }
    });
  }

  // Step 4: Handle classes in control flow statements
  // First create a copy without Liquid control flow tags
  const cleanedContent = content.replace(/{%[\s\S]*?%}/g, " ");

  // Step 5: Extract additional CSS selectors (class and ID patterns)
  const additionalSelectors = cleanedContent.match(/\.[\w-]+|#[\w-]+/g) || [];
  additionalSelectors.forEach((selector) => {
    // Remove the leading . or # to get the actual class or id name
    const name = selector.substring(1);
    selectors.add(name);
  });

  // Step 6: Extract from js-prefixed classes commonly used for JavaScript hooks
  const jsClassRegex = /js-[\w-]+/g;
  while ((match = jsClassRegex.exec(content)) !== null) {
    selectors.add(match[0]);
  }

  // Step 7: Extract from data attributes that might contain classes
  const dataAttrRegex = /data-[\w-]+=['"]([\w\s-]+)['"]/g;
  while ((match = dataAttrRegex.exec(content)) !== null) {
    addClassNames(match[1]);
  }

  // Convert the Set to an Array and return
  return Array.from(selectors);
};

/**
 * Combined content extractor that applies appropriate extraction method based on file type
 * The extractor from PurgeCSS receives just the content - we can't rely on options.extension
 */
const contentExtractor = (content) => {
  // We need to determine the file type from the content itself since options might not be available
  const selectors = new Set();

  // Run both extractors to be safe
  liquidExtractor(content).forEach((selector) => selectors.add(selector));
  jsExtractor(content).forEach((selector) => selectors.add(selector));

  // Basic extraction for anything else
  const classMatches = content.match(/\.[a-zA-Z0-9_-]+/g) || [];
  classMatches.forEach((cls) => selectors.add(cls.substring(1)));

  const idMatches = content.match(/#[a-zA-Z0-9_-]+/g) || [];
  idMatches.forEach((id) => selectors.add(id));

  return Array.from(selectors);
};

export const removeUnusedCSS = async (res) => {
  try {
    console.log("Starting PurgeCSS operation...");
    const { cssFiles, liquidFiles, jsFiles, themeId, shopId } =
      await getAllCssFilesForLiveTheme(res);
    console.log(
      `Found ${cssFiles.length} CSS files, ${liquidFiles.length} Liquid files, and ${jsFiles.length} JavaScript files.`
    );

    // Option 2: Process all CSS files against all Liquid and JS files
    console.log("Processing all CSS files against all Liquid and JS files...");

    const purgeCSS = new PurgeCSS();
    const result = await purgeCSS.purge({
      content: [
        ...liquidFiles.map((file) => ({
          raw: file.content,
          extension: "liquid",
        })),
        ...jsFiles.map((file) => ({
          raw: file.content,
          extension: "js",
        })),
      ],
      css: cssFiles.map((file) => ({
        raw: file.content,
        name: file.filename,
      })),
      defaultExtractor: contentExtractor,
      // Enhanced safelist for JavaScript-driven classes
      safelist: {
        standard: [
          // Common state classes
          "active",
          "selected",
          "current",
          "show",
          "hide",
          "open",
          "visible",
          "hidden",
          "disabled",
          "expanded",
          "collapsed",
          "loading",
          // Common animation classes
          "fade",
          "slide",
          "animate",
          "transition",
        ],
        deep: [
          // Pattern prefixes
          /^is-/,
          /^has-/,
          /^js-/,
          /^state-/,
          /^data-/,
          // Component-specific patterns
          /--active/,
          /--open/,
          /--visible/,
        ],
        greedy: [
          // State suffixes
          /-(active|selected|visible|show|hide|open|close|enabled|disabled)$/,
          // Animation suffixes
          /-(enter|leave|enter-active|leave-active|in|out|start|end)$/,
          // Common utility patterns
          /-(sm|md|lg|xl|2xl|hover|focus|active|disabled|first|last)$/,
        ],
      },
    });

    console.log(`PurgeCSS completed. Processed ${result.length} CSS files.`);

    // Log some stats about the purging operation
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
    });

    const finalResult = await updateThemeWithPurgedCSS(res, result, themeId);

    return finalResult;
  } catch (error) {
    console.error("PurgeCSS operation failed:", error);
    throw error;
  }
};

// Optional: Export the extractors for testing purposes
export const testExtractors = {
  liquid: liquidExtractor,
  js: jsExtractor,
  combined: contentExtractor,
};
