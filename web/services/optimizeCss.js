import { PurgeCSS } from "purgecss";

import { GetThemeFilesPaginated } from "../graphql/theme.js";
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

const createCSSImportMap = (cssFiles, liquidFiles) => {
  const importMap = new Map();
  const cssImportRegex =
    /["']([^"']+\.css)["']\s*\|\s*asset_url(?:\s*\|\s*stylesheet_tag)?/g;

  liquidFiles.forEach(({ filename: liquidFileName, content }) => {
    let match;
    while ((match = cssImportRegex.exec(content)) !== null) {
      const cssFilePath = match[1]; // e.g., 'styles.css' or 'assets/styles.css'
      const cssFileName = cssFilePath.split("/").pop(); // get just 'styles.css'

      if (!importMap.has(cssFileName)) {
        importMap.set(cssFileName, []);
      }

      importMap.get(cssFileName).push({ filename: liquidFileName, content });
    }
  });

  return importMap;
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
 * Purge unused CSS rules from a single CSS file based on a single Liquid file.
 *
 * @param {Object} cssFile - { filename, content } of the CSS file
 * @param {Object} liquidFiles - [{ filename, content }] array of the Liquid file
 * @returns {Promise<{ filename: string, purgedCSS: string }>}
 */
const runPurgeCSS = async (cssFile, liquidFiles) => {
  const purgeCSS = new PurgeCSS();
  const result = await purgeCSS.purge({
    content: liquidFiles.map((file) => ({
      raw: file.content,
      extension: "liquid",
    })),
    css: [
      {
        raw: cssFile.content,
      },
    ],
    defaultExtractor: liquidExtractor,
    // Add a safelist for common dynamic classes
    safelist: {
      standard: [
        "active",
        "selected",
        "current",
        "show",
        "hide",
        "open",
        "visible",
      ],
      deep: [/^is-/, /^has-/, /^js-/],
      greedy: [/-(active|selected|visible|show|hide)$/],
    },
  });

  return {
    filename: cssFile.filename,
    purgedCSS: result[0].css,
  };
};

export const removeUnusedCSS = async (res) => {
  try {
    console.log("Starting PurgeCSS operation...");
    const { cssFiles, liquidFiles, themeId, shopId } =
      await getAllCssFilesForLiveTheme(res);
    console.log(
      `Found ${cssFiles.length} CSS files and ${liquidFiles.length} Liquid files.`
    );

    // Option 1: Process CSS files individually matched with their liquid files
    // Uncomment this block to use the import map approach
    /*
    const importMap = createCSSImportMap(cssFiles, liquidFiles);
    const results = [];
    
    console.log(`Created import map with ${importMap.size} CSS-to-Liquid mappings.`);
    
    for (const [cssFileName, relevantLiquidFiles] of importMap.entries()) {
      const cssFile = cssFiles.find(({ filename }) => filename.includes(cssFileName));
      if (cssFile) {
        console.log(`Processing ${cssFile.filename} with ${relevantLiquidFiles.length} relevant Liquid files...`);
        const purgeCssResult = await runPurgeCSS(cssFile, relevantLiquidFiles);
        results.push(purgeCssResult);
      }
    }
    
    return results;
    */

    // Option 2: Process all CSS files against all Liquid files
    // This is your current approach, but with the improved extractor
    console.log("Processing all CSS files against all Liquid files...");

    const purgeCSS = new PurgeCSS();
    const result = await purgeCSS.purge({
      content: liquidFiles.map((file) => ({
        raw: file.content,
        extension: "liquid",
      })),
      css: cssFiles.map((file) => ({
        raw: file.content,
        name: file.filename,
      })),
      defaultExtractor: liquidExtractor,
      // Add a safelist for common dynamic classes
      safelist: {
        standard: [
          "active",
          "selected",
          "current",
          "show",
          "hide",
          "open",
          "visible",
        ],
        deep: [/^is-/, /^has-/, /^js-/],
        greedy: [/-(active|selected|visible|show|hide)$/],
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

    return result;
  } catch (error) {
    console.error("PurgeCSS operation failed:", error);
    throw error;
  }
};

// Optional: Export the extractor for testing purposes
export const testExtractor = (content) => {
  return liquidExtractor(content);
};
