/**
 * purgeCssUtil.js
 *
 * This utility now focuses ONLY on removing comments and normalizing
 * newlines/whitespace from CSS files using regular expressions.
 * It DOES NOT use PurgeCSS or attempt to remove unused CSS rules.
 */

/**
 * Removes CSS comments and normalizes whitespace/newlines from CSS content.
 * @param {string} cssContent - The CSS content string.
 * @returns {string} CSS content with comments removed and whitespace normalized.
 */
const cleanCssLightweight = (cssContent) => {
  if (typeof cssContent !== "string") return "";

  let cleaned = cssContent;

  // 1. Remove block comments: /* ... */
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\/|(?<![:\s])\/\/.*$/gm, "");

  // 2. Normalize newlines:
  //    - Replace multiple consecutive newlines (and any whitespace between them) with a single newline.
  cleaned = cleaned.replace(/(\r\n|\r|\n)\s*(\r\n|\r|\n)+/g, "\n");
  //    - Trim leading/trailing whitespace from each line (if any lines are just whitespace, they become empty)
  cleaned = cleaned
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
  //    - Remove completely empty lines that might result from trimming or original empty lines
  cleaned = cleaned.replace(/^\s*[\r\n]/gm, "");

  // 3. Basic whitespace normalization around key CSS characters:
  //    - Remove spaces before and after {, }, :, ;, ,
  cleaned = cleaned.replace(/\s*([{};:,])\s*/g, "$1");
  //    - Ensure one space after comma in multi-value properties (e.g., font-family, box-shadow)
  //      This is a bit more complex to do perfectly with a simple regex without over-reducing.
  //      The previous rule handles spaces *around* commas.
  //    - Reduce multiple spaces to a single space (if any remain after above steps)
  cleaned = cleaned.replace(/ {2,}/g, " ");

  return cleaned.trim(); // Trim the whole string at the end
};

/**
 * Processes CSS files to remove comments and normalize newlines/whitespace.
 * The `liquidFiles` and `jsFiles` arguments are no longer used for CSS processing
 * in this simplified version but are kept for signature consistency if your
 * calling code in `optimizeThemeCode.js` still passes them.
 *
 * @param {Array<{filename: string, content: string}>} liquidFiles - (Ignored for CSS processing in this version)
 * @param {Array<{filename: string, content: string}>} jsFiles - (Ignored for CSS processing in this version)
 * @param {Array<{filename: string, content: string}>} cssFiles - Array of CSS file objects to process.
 * @returns {Promise<Array<{file: string, css: string}>>}
 * Array of objects, where `css` is the cleaned CSS content.
 */
export const getOptimizedCss = async (cssFiles) => {
  console.log(
    "[CSSUtil] Starting lightweight CSS cleaning (comment and newline removal only)..."
  );

  if (!cssFiles || !Array.isArray(cssFiles)) {
    console.warn("[CSSUtil] No CSS files provided for cleaning.");
    return [];
  }

  const results = cssFiles.map((file) => {
    if (!file || typeof file.content !== "string" || !file.filename) {
      console.warn("[CSSUtil] Skipping invalid CSS file object:", file);
      return {
        file: file?.filename || "unknown_file",
        css: file?.content || "", // Return original content if invalid
      };
    }
    try {
      const cleanedCss = cleanCssLightweight(file.content);
      return {
        file: file.filename,
        css: cleanedCss,
      };
    } catch (error) {
      console.error(
        `[CSSUtil] Error cleaning CSS for ${file.filename}:`,
        error
      );
      return {
        // Return original content on error to be safe
        file: file.filename,
        css: file.content,
      };
    }
  });

  console.log(
    `[CSSUtil] Lightweight CSS cleaning completed for ${results.length} files.`
  );
  return results; // The function is async to maintain signature consistency, though regex is sync.
};
