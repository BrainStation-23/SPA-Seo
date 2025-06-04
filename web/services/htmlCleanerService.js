import cheerio from "cheerio";

/**
 * @typedef {Object} CleanerReport
 * @property {number} originalLength - Original length of the HTML string.
 * @property {number} cleanedLength - Length of the cleaned HTML string.
 * @property {number} bytesSaved - Bytes saved after cleaning.
 * @property {number} metaTagsRemoved - Count of removed meta tags.
 * @property {number} emptyElementsRemoved - Count of removed empty/redundant elements.
 * @property {number} attributesRemoved - Count of removed attributes.
 * @property {number} commentsRemoved - Count of removed HTML comments.
 * @property {number} elementsWhitelisted - Count of elements explicitly kept.
 * @property {number} attributesWhitelisted - Count of attributes explicitly kept.
 */

const _compileRegexPatterns = (patternsArray, defaultFlags = "i") => {
  if (!patternsArray || !Array.isArray(patternsArray)) return [];
  return patternsArray
    .map((patternStr) => {
      try {
        if (patternStr instanceof RegExp) return patternStr;
        const match = patternStr.match(/^\/(.+)\/([gimyus]*)$/);
        if (match) return new RegExp(match[1], match[2]);
        const escapedPatternStr = patternStr.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
        return new RegExp(escapedPatternStr, defaultFlags);
      } catch (e) {
        console.warn(
          `Invalid regex pattern string in config: "${patternStr}". Error: ${e.message}`
        );
        return null;
      }
    })
    .filter((p) => p instanceof RegExp);
};

const _removeMetaTags = ($, config, report, isLiquid) => {
  const metaTagsToRemove = config.metaTagsToRemove || [];
  metaTagsToRemove.forEach((tagName) => {
    const selector = `meta[name="${tagName}"], meta[property="${tagName}"]`;
    $(selector).each((i, el) => {
      const element = $(el);
      // For Liquid, ensure the meta tag doesn't contain Liquid output that might make its removal unsafe
      if (
        isLiquid &&
        (element.html()?.includes("{{") || element.html()?.includes("{%"))
      ) {
        report.elementsWhitelisted += 1;
        return;
      }
      element.remove();
      report.metaTagsRemoved = (report.metaTagsRemoved || 0) + 1;
    });
  });
};

const _removeHtmlComments = ($, config, report, isLiquid) => {
  if (!config.removeHtmlComments) return;
  const patternsToKeep = _compileRegexPatterns(
    config.whitelist?.commentPatternsToKeep || [],
    ""
  );
  $.root()
    .find("*")
    .contents()
    .filter((i, el) => el.type === "comment")
    .each((i, el) => {
      const commentNode = $(el);
      const commentText = commentNode.text() || "";
      // Skip if comment contains Liquid - too risky to remove automatically
      if (
        isLiquid &&
        (commentText.includes("{{") || commentText.includes("{%"))
      ) {
        report.elementsWhitelisted += 1;
        return;
      }
      let keepComment = patternsToKeep.some((pattern) =>
        pattern.test(commentText)
      );
      if (keepComment) {
        report.elementsWhitelisted += 1;
        return;
      }
      commentNode.remove();
      report.commentsRemoved = (report.commentsRemoved || 0) + 1;
    });
};

const _removeUnnecessaryAttributes = ($, config, report, isLiquid) => {
  const attributesToRemovePatterns = _compileRegexPatterns(
    config.attributesToRemovePatterns || []
  );
  const whitelistAttributes = config.whitelist?.attributes || new Set();

  $("*").each((i, el) => {
    const element = $(el);
    const attributes = { ...el.attribs };
    for (const attrName in attributes) {
      const attrNameLower = attrName.toLowerCase();
      let attrValue = attributes[attrName];

      // If processing Liquid and attribute value contains Liquid, be very careful or skip.
      // For now, we'll assume attribute removal patterns are for static parts.
      if ((isLiquid && attrValue.includes("{{")) || attrValue.includes("{%")) {
        if (
          attrNameLower === "style" &&
          config.removeEmptyStyles &&
          attrValue.trim() === ""
        ) {
          // An empty style attribute with no liquid is safe to remove
        } else if (
          attributesToRemovePatterns.some((pattern) => pattern.test(attrName))
        ) {
          // If a pattern matches an attribute containing liquid, it's risky.
          // We might want to log this or have a specific whitelist for such cases.
          // For now, let's be cautious and potentially skip if pattern matches but value has liquid.
          // This part needs careful thought on "how smart" it should be.
          // A simple safe rule: if `isLiquid` and `attrValue` has Liquid, don't remove by pattern unless pattern is VERY specific.
          // For now, the current logic will proceed, which could be risky.
        } else {
          // If it's a liquid-containing attribute not matching other rules, let it be.
          report.attributesWhitelisted += 1;
          continue;
        }
      }

      if (whitelistAttributes.has(attrNameLower)) {
        report.attributesWhitelisted += 1;
        continue;
      }
      if (
        config.removeEmptyStyles &&
        attrNameLower === "style" &&
        attrValue.trim() === ""
      ) {
        element.removeAttr(attrName);
        report.attributesRemoved += 1;
        continue;
      }
      let removedByPattern = attributesToRemovePatterns.some((pattern) => {
        if (pattern.test(attrName)) {
          // If it's a liquid file and the value contains liquid, do not remove by general pattern
          // unless the pattern is extremely specific and known to be safe with liquid.
          // This is a safety net.
          if (
            isLiquid &&
            (attrValue.includes("{{") || attrValue.includes("{%"))
          ) {
            console.warn(
              `[Liquid File] Attribute '${attrName}' matches removal pattern but contains Liquid. Skipped removal.`
            );
            report.attributesWhitelisted += 1;
            return false; // Don't remove
          }
          element.removeAttr(attrName);
          report.attributesRemoved += 1;
          return true;
        }
        return false;
      });
      if (removedByPattern) continue;

      if (
        config.removeAllUncategorizedDataAttributes &&
        attrNameLower.startsWith("data-")
      ) {
        // Add same safety for data attributes with liquid content
        if (
          isLiquid &&
          (attrValue.includes("{{") || attrValue.includes("{%"))
        ) {
          console.warn(
            `[Liquid File] Data attribute '${attrName}' would be removed by removeAllUncategorizedDataAttributes but contains Liquid. Skipped removal.`
          );
          report.attributesWhitelisted += 1;
          continue;
        }
        element.removeAttr(attrName);
        report.attributesRemoved += 1;
      }
    }
  });
};

const _removeEmptyElements = ($, config, report, isLiquid) => {
  const emptyElementsToRemove = config.emptyElementsToRemove || [];
  const whitelistTags = config.whitelist?.tags || new Set();
  const shopifyRequiredSelectors =
    config.whitelist?.shopifyRequiredSelectors || [];
  // const whitelistAttributes = config.whitelist?.attributes || new Set(); // Already available in calling scope

  let removedInThisPass;
  let maxPasses = isLiquid ? 1 : 3; // Fewer passes for Liquid to be safer
  let currentPass = 0;
  do {
    removedInThisPass = 0;
    currentPass++;
    $(emptyElementsToRemove.join(",")).each((i, el) => {
      const element = $(el);
      if (!element.length || !element[0]?.tagName) return;
      const tagName = element.prop("tagName").toLowerCase();

      if (
        whitelistTags.has(tagName) ||
        shopifyRequiredSelectors.some(
          (sel) => element.is(sel) || element.closest(sel).length > 0
        )
      ) {
        report.elementsWhitelisted += 1;
        return;
      }

      // For Liquid, if the element's direct text content (which includes Liquid tags for Cheerio) is not empty, don't remove.
      if (isLiquid && element.text().trim() !== "") {
        // Check if text content is ONLY Liquid tags that might render nothing. This is complex.
        // A safer bet: if it contains '{{' or '{%', assume it might render content.
        if (element.text().includes("{{") || element.text().includes("{%")) {
          report.elementsWhitelisted += 1;
          return;
        }
      }

      let hasNonEmptyTextNode = false;
      element.contents().each((idx, childNode) => {
        if (childNode.type === "text" && childNode.data.trim() !== "") {
          // If processing liquid, and this text node IS a liquid tag, it's not "empty"
          if (
            isLiquid &&
            (childNode.data.includes("{{") || childNode.data.includes("{%"))
          ) {
            hasNonEmptyTextNode = true; // Treat as non-empty
            return false;
          }
          hasNonEmptyTextNode = true;
          return false;
        }
      });

      if (element.children().length === 0 && !hasNonEmptyTextNode) {
        const attrs = Object.keys(el.attribs);
        if (attrs.length === 0) {
          element.remove();
          report.emptyElementsRemoved += 1;
          removedInThisPass++;
        } else {
          // If it's a liquid file, be more hesitant to remove elements with attributes.
          // Only remove if attributes are very clearly bloat and not potentially used by Liquid/JS.
          // For now, if isLiquid and has attributes, let's be cautious and whitelist it.
          if (isLiquid) {
            report.elementsWhitelisted += 1;
            return;
          }
          const hasProtectiveAttribute = attrs.some(
            (attr) =>
              attr.toLowerCase() === "id" ||
              !(config.whitelist?.attributes || new Set()).has(
                attr.toLowerCase()
              )
          );
          if (!hasProtectiveAttribute) {
            element.remove();
            report.emptyElementsRemoved += 1;
            removedInThisPass++;
          } else {
            report.elementsWhitelisted += 1;
          }
        }
      }
    });
  } while (removedInThisPass > 0 && currentPass < maxPasses);
};

const _collapseWhitespace = ($, config, report, isLiquid) => {
  if (!config.collapseWhitespace || isLiquid) {
    // Disable for liquid files by default, too risky
    if (isLiquid && config.collapseWhitespace) {
      console.warn(
        "[Liquid File] Aggressive whitespace collapsing is enabled but generally unsafe for Liquid. Skipping this step."
      );
    }
    return;
  }
  // ... (keep the previous _collapseWhitespace logic from File 6, but it's now conditional)
  const preserveWhitespaceTags = new Set([
    "pre",
    "textarea",
    "script",
    "style",
  ]);
  $("*").each((i, el) => {
    const element = $(el);
    const tagName = el.tagName ? el.tagName.toLowerCase() : "";
    if (preserveWhitespaceTags.has(tagName)) return;

    element.contents().each((idx, childNode) => {
      if (childNode.type === "text") {
        const originalText = childNode.data;
        let newText = originalText.replace(/\s\s+/g, " ");
        if (
          newText !== originalText &&
          newText.trim() === "" &&
          originalText.trim() !== ""
        )
          newText = " ";
        else newText = newText.trim();
        if (newText !== originalText) {
          if (newText === "" && originalText.trim() === "") {
            childNode.data = "";
          } else {
            childNode.data = newText;
          }
        }
      }
    });
  });
  $.root()
    .find("*")
    .contents()
    .filter((i, el) => el.type === "text" && el.data === "")
    .remove();
};

/**
 * Main function to clean HTML content based on configuration.
 * @param {string} htmlString - The raw HTML string (can be plain HTML or Liquid-infused HTML).
 * @param {object} config - Configuration object from settingsService.js.
 * @param {boolean} [isLiquidFile=false] - Flag to indicate if the content is primarily a Liquid template.
 * @returns {Promise<{cleanedHtml: string, report: CleanerReport}>}
 */
const cleanHtml = async (htmlString, config, isLiquidFile = false) => {
  const report = {
    /* ... initial report ... */
  };
  // ... (setup as before) ...

  if (
    !htmlString ||
    !config ||
    typeof config !== "object" ||
    Object.keys(config).length === 0
  ) {
    // ... (return original if no valid input) ...
  }

  config.whitelist = {
    /* ... (normalize config.whitelist as before) ... */
  };
  const $ = cheerio.load(htmlString, { decodeEntities: false, xmlMode: false });

  _removeMetaTags($, config, report, isLiquidFile);
  _removeHtmlComments($, config, report, isLiquidFile);
  _removeUnnecessaryAttributes($, config, report, isLiquidFile);

  if (config.collapseWhitespace) {
    _collapseWhitespace($, config, report, isLiquidFile);
  }

  _removeEmptyElements($, config, report, isLiquidFile);
  _removeEmptyElements($, config, report, isLiquidFile);
  _removeEmptyElements($, config, report, isLiquidFile);

  const cleanedHtml = $.html();
  // ... (calculate report.cleanedLength, report.bytesSaved) ...
  return { cleanedHtml, report };
};

export default { cleanHtml };
