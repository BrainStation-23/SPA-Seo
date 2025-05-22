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

// Fixed safelist configuration (replace the safelist part in your removeUnusedCSS function)
const enhancedSafelist = {
  // Standard safelist - direct class names that should always be preserved
  standard: [
    // Common state classes
    "active",
    "inactive",
    "selected",
    "current",
    "show",
    "hide",
    "open",
    "closed",
    "visible",
    "hidden",
    "disabled",
    "enabled",
    "expanded",
    "collapsed",
    "loading",
    "loaded",
    "error",
    "success",

    // Common animation classes
    "fade",
    "slide",
    "animate",
    "transition",
    "reveal",
    "scroll",
    "swipe",
    "zoom",
    "grow",
    "shrink",

    // Layout classes
    "container",
    "row",
    "column",
    "grid",
    "flex",
    "block",
    "inline",
    "relative",
    "absolute",
    "fixed",
    "sticky",

    // Common Shopify-specific layout classes
    "page-width",
    "grid__item",
    "wrapper",
    "site-header",
    "site-footer",
    "main-content",
    "section",
    "footer",
    "header",
    "sidebar",

    // Navigation
    "menu",
    "submenu",
    "dropdown",
    "nav",
    "navigation",
    "navbar",
    "site-nav",
    "subnav",
    "pagination",
    "breadcrumb",

    // Product/Collection related
    "product",
    "product-form",
    "product-media",
    "product-single",
    "collection",
    "collection-grid",
    "variant-selector",

    // Cart related
    "cart",
    "cart-item",
    "cart-drawer",
    "mini-cart",
    "checkout",

    // Form elements
    "form",
    "input",
    "select",
    "textarea",
    "button",
    "label",
    "checkbox",
    "radio",
    "switch",
    "fieldset",

    // Utility classes (Bootstrap/Foundation style)
    "text-center",
    "text-left",
    "text-right",
    "text-justify",
    "margin",
    "padding",
    "border",
    "shadow",
    "rounded",
    "circle",

    // Mobile/responsive classes
    "mobile",
    "desktop",
    "tablet",
    "hide-on-mobile",
    "show-on-desktop",
    "small-up",
    "medium-up",
    "large-up",
    "small-only",
    "medium-only",

    // Media
    "image",
    "video",
    "img",
    "media",
    "icon",
    "thumbnail",
    "avatar",
    "lazyload",
    "lazy",
    "responsive-image",
    "aspect-ratio",

    // Common Shopify section/component classes
    "announcement-bar",
    "predictive-search",
    "search-modal",
    "featured-product",
    "featured-collection",
    "slideshow",
    "testimonials",
    "newsletter",
    "rich-text",
    "map",
    "video-section",

    // Modal/popup related
    "modal",
    "popup",
    "drawer",
    "overlay",
    "dialog",
    "tooltip",
  ],

  // Deep patterns - matches any class containing these patterns
  deep: [
    // Pattern prefixes
    /^is-/,
    /^has-/,
    /^js-/,
    /^data-/,
    /^state-/,
    /^u-/,
    /^f-/,
    /^l-/,
    /^c-/,
    /^o-/, // Common CSS naming conventions

    // Component-specific patterns
    /--active/,
    /--open/,
    /--visible/,
    /--selected/,
    /--hover/,
    /--focus/,
    /--disabled/,
    /--error/,
    /--success/,
    /--warning/,

    // Common Shopify patterns
    /^shopify-/,
    /^predictive-/,
    /^product-/,
    /^collection-/,
    /^cart-/,
    /^search-/,
    /^customer-/,
    /^site-/,
    /^page-/,

    // Tailwind-style utility classes
    /^bg-/,
    /^text-/,
    /^border-/,
    /^rounded-/,
    /^shadow-/,
    /^p-/,
    /^m-/,
    /^w-/,
    /^h-/,
    /^flex-/,
    /^grid-/,
    /^gap-/,

    // Theme-specific patterns (add your own)
    /^theme-/,
    /^template-/,
    /^section-/,

    // Animation patterns
    /^animate-/,
    /^transition-/,
    /^transform-/,

    // State pattern suffixes for BEM
    /__/,
    /--/,
  ],

  // Greedy patterns - will keep any classes that match these patterns
  greedy: [
    // State suffixes
    /-(active|inactive|selected|visible|hidden|show|hide|open|close|enabled|disabled|loading|loaded|error|success)$/,

    // Animation suffixes
    /-(enter|leave|enter-active|leave-active|in|out|start|end|animation|transition|transform)$/,

    // Responsive suffixes
    /-(xs|sm|md|lg|xl|2xl|mobile|tablet|desktop|small|medium|large)$/,
    /-(only|up|down)$/,

    // Common utility patterns
    /-(hover|focus|active|disabled|first|last|odd|even)$/,

    // Classes with numbers (e.g. grid-cols-3, col-span-2)
    /-\d+$/,
  ],

  // Keyframes - retain keyframe animations
  keyframes: true,

  // Variables - retain CSS variables
  variables: true,

  // Fonts - retain @font-face rules
  fonts: true,
};

/**
 * Enhanced JS extractor function that captures classes used in JavaScript
 * This version includes more patterns and handling for template literals
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

  // classList operations - expanded to catch more patterns
  const classListRegex =
    /classList\.(?:add|remove|toggle|contains|replace)\(['"]([^'"]+)['"](?:,\s*['"]([^'"]+)['"])?\)/g;
  while ((match = classListRegex.exec(content)) !== null) {
    match[1].split(/\s+/).forEach((cls) => selectors.add(cls.trim()));
    // For replace operations, capture the second parameter too
    if (match[2]) {
      match[2].split(/\s+/).forEach((cls) => selectors.add(cls.trim()));
    }
  }

  // className assignments with string literals
  const classNameRegex = /(?:className|class)\s*=\s*['"]([^'"]+)['"]/g;
  while ((match = classNameRegex.exec(content)) !== null) {
    match[1].split(/\s+/).forEach((cls) => selectors.add(cls.trim()));
  }

  // Template literals for className/class - more thorough pattern
  const templateLiteralRegex = /(?:className|class)\s*=\s*`([^`]*)`/g;
  while ((match = templateLiteralRegex.exec(content)) !== null) {
    // Process the template literal content, preserving all potential class names
    const literalContent = match[1];

    // Extract static parts from template literals
    const staticParts = literalContent
      .replace(/\${[^}]*}/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    staticParts.forEach((cls) => selectors.add(cls.trim()));

    // Try to capture classes within template expressions
    const expressionMatches = literalContent.match(/\${([^}]*)}/g) || [];
    expressionMatches.forEach((expr) => {
      // Extract potential class names from the expression
      const cleaned = expr.replace(/\${|\}/g, "");
      // Look for string literals within the expression that might be classes
      const stringLiterals = cleaned.match(/['"]([^'"]+)['"]/g) || [];
      stringLiterals.forEach((literal) => {
        const classes = literal.replace(/['"]/g, "").split(/\s+/);
        classes.forEach((cls) => selectors.add(cls.trim()));
      });
    });
  }

  // Event delegation with class selectors
  const eventDelegationRegex = /\.on\(['"](?:\w+)['"]\s*,\s*['"]([^'"]+)['"]/g;
  while ((match = eventDelegationRegex.exec(content)) !== null) {
    const selector = match[1];
    const classMatches = selector.match(/\.[a-zA-Z0-9_-]+/g);
    if (classMatches) {
      classMatches.forEach((cls) => selectors.add(cls.substring(1)));
    }
  }

  // jQuery class operations - expanded patterns
  const jQueryClassRegex =
    /\$\([^)]*\)\.(?:addClass|removeClass|toggleClass|hasClass|is)\(['"]([^'"]+)['"]\)/g;
  while ((match = jQueryClassRegex.exec(content)) !== null) {
    match[1].split(/\s+/).forEach((cls) => selectors.add(cls.trim()));
  }

  // jQuery selectors with classes
  const jQuerySelectorRegex = /\$\(['"]([^'"]+)['"]\)/g;
  while ((match = jQuerySelectorRegex.exec(content)) !== null) {
    const selector = match[1];
    const classMatches = selector.match(/\.[a-zA-Z0-9_-]+/g);
    if (classMatches) {
      classMatches.forEach((cls) => selectors.add(cls.substring(1)));
    }
  }

  // String concatenation for classes - commonly used in dynamic class generation
  const stringConcatRegex =
    /(?:class|className)\s*=\s*['"]([^'"]+)['"]\s*\+\s*['"]([^'"]+)['"]/g;
  while ((match = stringConcatRegex.exec(content)) !== null) {
    [match[1], match[2]].forEach((part) => {
      part.split(/\s+/).forEach((cls) => selectors.add(cls.trim()));
    });
  }

  // Vanilla JS element creation with classes
  const createElementRegex =
    /createElement\(['"]\w+['"](?:,\s*\{[^}]*class(?:Name)?:\s*['"]([^'"]+)['"])/g;
  while ((match = createElementRegex.exec(content)) !== null) {
    match[1].split(/\s+/).forEach((cls) => selectors.add(cls.trim()));
  }

  // Classes in object literals (often used in component props)
  const objectLiteralRegex = /class(?:Name)?:\s*['"]([^'"]+)['"]/g;
  while ((match = objectLiteralRegex.exec(content)) !== null) {
    match[1].split(/\s+/).forEach((cls) => selectors.add(cls.trim()));
  }

  // Check for special comments that explicitly list classes to keep
  const keepClassesRegex =
    /\/[*\/]\s*purge(?:css)?:?\s*(?:ignore|keep)(?:-classes)?\s*(?:[*\/])?\s*(.+?)(?:\s*\*\/|\s*$)/g;
  while ((match = keepClassesRegex.exec(content)) !== null) {
    match[1]
      .split(/[\s,]+/)
      .filter(Boolean)
      .forEach((cls) => selectors.add(cls.trim()));
  }

  // Shopify-specific class manipulations
  const shopifyClassRegex =
    /(?:section|block|theme)\.(?:settings|class|className|classList)\s*[\.\[]?\s*['"]([^'"]+)['"]/g;
  while ((match = shopifyClassRegex.exec(content)) !== null) {
    match[1].split(/\s+/).forEach((cls) => selectors.add(cls.trim()));
  }

  // Class manipulations in variables
  const varClassRegex = /(?:const|let|var)\s+\w+\s*=\s*['"]([^'"]+)['"]/g;
  while ((match = varClassRegex.exec(content)) !== null) {
    // Only consider if it looks like a class name (avoid capturing all strings)
    const potentialClasses = match[1].split(/\s+/);
    potentialClasses.forEach((cls) => {
      // Heuristic: class names often contain dashes or match BEM patterns
      if (
        cls.includes("-") ||
        /^[a-z][a-z0-9]*(?:__[a-z0-9]+)?(?:--[a-z0-9]+)?$/.test(cls)
      ) {
        selectors.add(cls.trim());
      }
    });
  }

  // getAttribute and setAttribute for class
  const getSetAttributeRegex =
    /(?:get|set)Attribute\(['"]class['"],\s*['"]([^'"]+)['"]\)/g;
  while ((match = getSetAttributeRegex.exec(content)) !== null) {
    match[1].split(/\s+/).forEach((cls) => selectors.add(cls.trim()));
  }

  // CSS-in-JS style objects
  const cssInJsRegex =
    /(?:styled|css|className)\s*(?:=|\()\s*[`'"]([^`'"]*)[`'"]/g;
  while ((match = cssInJsRegex.exec(content)) !== null) {
    const cssContent = match[1];
    const classMatches = cssContent.match(/\.[a-zA-Z0-9_-]+/g);
    if (classMatches) {
      classMatches.forEach((cls) => selectors.add(cls.substring(1)));
    }
  }

  // Data attributes that might contain classes
  const dataClassRegex =
    /data-(?:class|toggle|target|parent)=['"]([^'"]+)['"]/g;
  while ((match = dataClassRegex.exec(content)) !== null) {
    match[1].split(/\s+/).forEach((cls) => selectors.add(cls.trim()));
  }

  // Animation/transition classes often added dynamically
  const animationRegex =
    /(?:add|remove)Class\(['"]([^'"]*(?:enter|leave|active|transition|animate|fade|slide)[^'"]*)['"]/g;
  while ((match = animationRegex.exec(content)) !== null) {
    match[1].split(/\s+/).forEach((cls) => selectors.add(cls.trim()));
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
      safelist: enhancedSafelist,
    });

    console.log(`PurgeCSS completed. Processed ${result.length} CSS files.`);

    // Filter results to only include files with non-zero reduction
    const filteredResult = [];

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
        filteredResult.push({
          ...item,
          originalSize: originalSize,
        });
      } else {
        console.log(`Skipping ${item.file} - no CSS reduction detected`);
      }
    });

    console.log(
      `${filteredResult.length} out of ${result.length} CSS files will be updated.`
    );

    // Only proceed with theme update if there are files to update
    if (filteredResult.length === 0) {
      console.log("No CSS files require updating. Theme update skipped.");
      return [];
    }

    const finalResult = await updateThemeWithPurgedCSS(
      res,
      filteredResult,
      themeId
    );

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
