// File: SPA-Seo/web/services/htmlCleanerService.js

import { load } from "cheerio"; // Corrected Cheerio import

// --- STATIC CONFIGURATION ---
const STATIC_CLEANER_CONFIG = {
  enabled: true,
  metaTagsToRemove: [
    "seogid",
    "generator",
    "shopify-digital-wallet",
    "x-shopify-theme",
    "csrf-token",
  ],
  emptyElementsToRemove: ["div", "span", "p", "section"],
  attributesToRemovePatterns: [
    "^data-shopify-tracking",
    "^data-mce-",
    "^data-gramm_id",
    "^data-gramm",
    "^data-test-",
    "debug-id",
  ],
  removeAllUncategorizedDataAttributes: false,
  removeEmptyStyles: true,
  removeHtmlComments: true,
  collapseWhitespace: true,
  whitelist: {
    tags: new Set([
      "script",
      "style",
      "template",
      "form",
      "input",
      "select",
      "textarea",
      "button",
      "iframe",
      "link",
      "meta",
      "br",
      "hr",
      "img",
      "canvas",
      "video",
      "audio",
      "pre",
      "code",
      "svg",
      "path",
      "noscript",
      "source",
      "track",
      "figure",
      "figcaption",
    ]),
    attributes: new Set([
      "id",
      "class",
      "style",
      "href",
      "src",
      "action",
      "method",
      "type",
      "value",
      "name",
      "rel",
      "target",
      "alt",
      "title",
      "for",
      "role",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "aria-hidden",
      "aria-expanded",
      "aria-controls",
      "aria-live",
      "aria-pressed",
      "aria-checked",
      "aria-selected",
      "aria-current",
      "aria-required",
      "aria-disabled",
      "aria-invalid",
      "disabled",
      "readonly",
      "required",
      "checked",
      "selected",
      "pattern",
      "placeholder",
      "autocomplete",
      "spellcheck",
      "contenteditable",
      "media",
      "property",
      "content",
      "charset",
      "http-equiv",
      "itemscope",
      "itemtype",
      "itemprop",
      "datetime",
      "lang",
      "dir",
      "data-section-id",
      "data-section-type",
      "data-shopify-editor-section",
      "data-shopify-editor-block",
      "data-product-id",
      "data-product-handle",
      "data-variant-id",
      "data-shopify",
      "data-handle",
      "data-value",
      "data-index",
      "data-filter",
      "data-filter-type",
      "data-cart-render",
      "data-cart-static-render",
      "data-ajax-cart-section",
      "data-modal-id",
      "data-modal-target",
      "data-bs-toggle",
      "data-bs-target",
      "data-toggle",
      "data-target",
      "data-component",
      "data-action",
      "data-bind",
      "data-js",
      "data-module",
      "data-controller",
      "onclick",
      "onsubmit",
      "onchange",
      "onkeyup",
      "onkeydown",
      "onkeypress",
      "onfocus",
      "onblur",
      "oninput",
      "onload",
      "onerror",
      "onmouseover",
      "onmouseout",
      "viewbox",
      "xmlns",
      "fill",
      "stroke",
      "stroke-width",
      "d",
      "preserveaspectratio",
      "x",
      "y",
      "width",
      "height",
      "cx",
      "cy",
      "r",
      "rx",
      "ry",
      "fx",
      "fy",
      "points",
      "transform",
      "gradientunits",
      "spreadmethod",
      "offset",
      "stop-color",
      "stop-opacity",
    ]),
    classes: new Set([
      "shopify-challenge__container",
      "shopify-payment-button__button",
      "product-form",
      "product-form__input",
      "product-form__submit",
      "cart-form",
      "js-",
      "is-active",
      "is-visible",
      "is-hidden",
      "active",
      "hidden",
      "open",
      "no-js",
      "lazyload",
      "lazyloading",
      "lazyloaded",
    ]),
    shopifyRequiredSelectors: [
      'form[action^="/cart"]',
      'form[action^="/account"]',
      'form[action^="/contact"]',
      'form[action*="product_id"]',
      'form[action*="/localization"]',
      'form[action*="/currency"]',
      '[id^="shopify-section-"]',
      ".shopify-payment-button",
      '[data-shopify="payment-button"]',
      "#shopify-content",
      ".product-form",
      "[data-product-form]",
      "[data-productid]",
      '[id^="product-form-"]',
      ".cart-form",
      'script[src*="shopify_common.js"]',
      'script[src*="option_selection.js"]',
      'script[id="shopify-features"]',
      'script[type="application/json"][data-product-json]',
      'meta[name="csrf-token"]',
      'meta[property^="og:"]',
      'meta[name^="twitter:"]',
      'link[rel="canonical"]',
      'link[rel="alternate"]',
      'link[rel="preconnect"]',
      "[data-shopify-editor-section]",
      "[data-shopify-editor-block]",
      "#MainContent",
      "#PageContainer",
      "#cart-drawer",
      "#CartDrawer",
      "[data-section-id][data-section-type]",
      'script[type="application/ld+json"]',
      "iframe",
    ],
    commentPatternsToKeep: [
      "^\\[if\\s",
      "^<!\\[endif\\]",
      "Copyright",
      "license",
      "^eslint-",
      "^stylelint-",
      "^prettier-",
      "^webpackChunkName:",
      "^\\s*global\\s",
      "^\\s*exported\\s",
      "NOTE:",
      "TODO:",
      "FIXME:",
    ],
  },
};
// --- END OF STATIC CONFIGURATION ---

/** @typedef {import('./htmlCleanerService').CleanerReport} CleanerReport */ // For JSDoc

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
          `Invalid regex pattern: "${patternStr}". Error: ${e.message}`
        );
        return null;
      }
    })
    .filter((p) => p instanceof RegExp);
};

const _removeMetaTags = ($, config, report, isLiquidFile) => {
  (config.metaTagsToRemove || []).forEach((tagName) => {
    const selector = `meta[name="${tagName}"], meta[property="${tagName}"]`;
    $(selector).each((i, el) => {
      const element = $(el);
      if (
        isLiquidFile &&
        (element.html()?.includes("{{") || element.html()?.includes("{%"))
      ) {
        report.elementsWhitelisted = (report.elementsWhitelisted || 0) + 1;
        return;
      }
      element.remove();
      report.metaTagsRemoved = (report.metaTagsRemoved || 0) + 1;
    });
  });
};

const _removeHtmlComments = ($, config, report, isLiquidFile) => {
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
      if (
        isLiquidFile &&
        (commentText.includes("{{") || commentText.includes("{%"))
      ) {
        report.elementsWhitelisted = (report.elementsWhitelisted || 0) + 1;
        return;
      }
      if (patternsToKeep.some((pattern) => pattern.test(commentText))) {
        report.elementsWhitelisted = (report.elementsWhitelisted || 0) + 1;
        return;
      }
      commentNode.remove();
      report.commentsRemoved = (report.commentsRemoved || 0) + 1;
    });
};

const _removeUnnecessaryAttributes = ($, config, report, isLiquidFile) => {
  const attributesToRemovePatterns = _compileRegexPatterns(
    config.attributesToRemovePatterns || []
  );
  const whitelistAttributes = config.whitelist?.attributes;

  $("*").each((i, el) => {
    const element = $(el);
    const attributes = { ...el.attribs };
    for (const attrName in attributes) {
      const attrNameLower = attrName.toLowerCase();
      const attrValue = attributes[attrName];

      // ** CRITICAL GUARD FOR LIQUID IN ATTRIBUTE VALUES **
      if (
        isLiquidFile &&
        (attrValue.includes("{{") || attrValue.includes("{%"))
      ) {
        // If the attribute value contains Liquid, do not remove it by general patterns or generic data-* removal rules.
        // Only allow removal if it's an empty style attribute (which is less likely to contain Liquid if truly empty).
        // Or if it's on a specific "safe to remove even if value is liquid" list (not implemented here).
        if (
          attrNameLower === "style" &&
          config.removeEmptyStyles &&
          attrValue.trim() === ""
        ) {
          // Ok to remove empty style="" even if isLiquidFile is true, as Liquid is not present in value.
        } else {
          // For any other attribute whose value contains Liquid, treat it as whitelisted against general removal.
          // Check if it would have been removed by a pattern or by removeAllUncategorizedDataAttributes
          const wouldBeRemovedByPattern = attributesToRemovePatterns.some(
            (pattern) => pattern.test(attrName)
          );
          const wouldBeRemovedByDataRule =
            config.removeAllUncategorizedDataAttributes &&
            attrNameLower.startsWith("data-") &&
            !whitelistAttributes.has(attrNameLower);

          if (wouldBeRemovedByPattern || wouldBeRemovedByDataRule) {
            console.warn(
              `[Liquid File] Attribute '${attrName}' with value "${attrValue.substring(
                0,
                30
              )}..." was targeted for removal but kept because its value contains Liquid.`
            );
            report.attributesWhitelisted =
              (report.attributesWhitelisted || 0) + 1;
          }
          continue; // Skip all further removal logic for this Liquid-containing attribute
        }
      }

      if (whitelistAttributes.has(attrNameLower)) {
        report.attributesWhitelisted = (report.attributesWhitelisted || 0) + 1;
        continue;
      }
      if (
        config.removeEmptyStyles &&
        attrNameLower === "style" &&
        attrValue.trim() === ""
      ) {
        element.removeAttr(attrName);
        report.attributesRemoved = (report.attributesRemoved || 0) + 1;
        continue;
      }
      let removedByPattern = attributesToRemovePatterns.some((pattern) => {
        if (pattern.test(attrName)) {
          element.removeAttr(attrName);
          report.attributesRemoved = (report.attributesRemoved || 0) + 1;
          return true;
        }
        return false;
      });
      if (removedByPattern) continue;

      if (
        config.removeAllUncategorizedDataAttributes &&
        attrNameLower.startsWith("data-")
      ) {
        element.removeAttr(attrName);
        report.attributesRemoved = (report.attributesRemoved || 0) + 1;
      }
    }
  });
};

const _removeEmptyElements = ($, config, report, isLiquidFile) => {
  const emptyElementsToRemove = config.emptyElementsToRemove || [];
  const whitelistTags = config.whitelist?.tags;
  const shopifyRequiredSelectors =
    config.whitelist?.shopifyRequiredSelectors || [];
  const whitelistAttributes = config.whitelist?.attributes;

  let removedInThisPass;
  let maxPasses = isLiquidFile ? 1 : 3;
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
        report.elementsWhitelisted = (report.elementsWhitelisted || 0) + 1;
        return;
      }
      const elementTextForLiquidCheck = element.text();
      if (
        isLiquidFile &&
        (elementTextForLiquidCheck.includes("{{") ||
          elementTextForLiquidCheck.includes("{%"))
      ) {
        report.elementsWhitelisted = (report.elementsWhitelisted || 0) + 1;
        return;
      }
      let hasNonEmptyTextNode = false;
      element.contents().each((idx, childNode) => {
        if (childNode.type === "text" && childNode.data.trim() !== "") {
          hasNonEmptyTextNode = true;
          return false;
        }
      });
      if (element.children().length === 0 && !hasNonEmptyTextNode) {
        const attrs = Object.keys(el.attribs);
        if (attrs.length === 0) {
          element.remove();
          report.emptyElementsRemoved = (report.emptyElementsRemoved || 0) + 1;
          removedInThisPass++;
        } else {
          if (isLiquidFile) {
            report.elementsWhitelisted = (report.elementsWhitelisted || 0) + 1;
            return;
          }
          const hasProtectiveAttribute = attrs.some(
            (attr) =>
              attr.toLowerCase() === "id" ||
              !whitelistAttributes.has(attr.toLowerCase())
          );
          if (!hasProtectiveAttribute) {
            element.remove();
            report.emptyElementsRemoved =
              (report.emptyElementsRemoved || 0) + 1;
            removedInThisPass++;
          } else {
            report.elementsWhitelisted = (report.elementsWhitelisted || 0) + 1;
          }
        }
      }
    });
  } while (removedInThisPass > 0 && currentPass < maxPasses);
};

const _collapseWhitespace = ($, config, report, isLiquidFile) => {
  if (!config.collapseWhitespace) return;
  if (isLiquidFile && config.collapseWhitespace) {
    console.warn(
      "[Liquid File] Whitespace collapsing enabled but applied very conservatively: only removing fully empty text nodes."
    );
    $.root()
      .find("*")
      .contents()
      .filter((i, el) => el.type === "text" && el.data.trim() === "")
      .remove();
    return;
  }
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
        if (newText !== originalText)
          childNode.data =
            newText === "" && originalText.trim() === "" ? "" : newText;
      }
    });
  });
  $.root()
    .find("*")
    .contents()
    .filter((i, el) => el.type === "text" && el.data === "")
    .remove();
};

const cleanHtml = async (htmlString, isLiquidFile = false) => {
  const config = STATIC_CLEANER_CONFIG;
  const report = {
    originalLength: htmlString?.length || 0,
    cleanedLength: 0,
    bytesSaved: 0,
    metaTagsRemoved: 0,
    emptyElementsRemoved: 0,
    attributesRemoved: 0,
    commentsRemoved: 0,
    elementsWhitelisted: 0,
    attributesWhitelisted: 0,
  };
  if (!htmlString || typeof htmlString !== "string") {
    report.cleanedLength = report.originalLength;
    console.warn(
      "HTMLCleanerService: cleanHtml called with invalid htmlString."
    );
    return { cleanedHtml: htmlString, report };
  }
  if (!config.enabled) {
    report.cleanedLength = report.originalLength;
    console.log(
      "HTMLCleanerService: CleanHTML called but feature is disabled in static config."
    );
    return { cleanedHtml: htmlString, report };
  }
  const activeConfig = config; // Using static config directly, Sets are already initialized in it.
  const $ = load(htmlString, { decodeEntities: false, xmlMode: false });

  _removeMetaTags($, activeConfig, report, isLiquidFile);
  _removeHtmlComments($, activeConfig, report, isLiquidFile);
  _removeUnnecessaryAttributes($, activeConfig, report, isLiquidFile); // Critical change here
  if (activeConfig.collapseWhitespace)
    _collapseWhitespace($, activeConfig, report, isLiquidFile);
  _removeEmptyElements($, activeConfig, report, isLiquidFile);
  _removeEmptyElements($, activeConfig, report, isLiquidFile);

  let cleanedHtmlResult = $.html();
  if (isLiquidFile) {
    cleanedHtmlResult = cleanedHtmlResult
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&amp;/g, "&");
  }
  report.cleanedLength = cleanedHtmlResult.length;
  report.bytesSaved = report.originalLength - report.cleanedLength;
  return { cleanedHtml: cleanedHtmlResult, report };
};

export default { cleanHtml };
