// utils/optimizeJsUtil.js

import { minify } from "terser";

/**
 * Optimizes a single JavaScript file content using only Terser.
 * This function will:
 * 1. Remove dead and unused local code using Terser.
 * 2. Remove specified logger calls (console.*, custom) using Terser.
 * 3. Remove all comments using Terser.
 * 4. Remove unnecessary newlines and spaces using Terser.
 *
 * @param {string} code - The JavaScript code string.
 * @param {string} filename - The name of the file being processed (for logging).
 * @param {Object} [options] - Optional settings.
 * @param {boolean} [options.removeConsoleLogs=true] - Whether to remove console.* calls.
 * @param {Array<string>} [options.customLoggersToRemove=[]] - Custom logger function names.
 * @param {boolean} [options.removeAllComments=true] - Whether to remove all comments.
 * @returns {Promise<{ optimizedCode: string, actionsTakenLog: Array<string>, originalSize: number, finalSize: number }>}
 */
async function optimizeSingleJsFileWithTerser(code, filename, options = {}) {
  const {
    removeConsoleLogs = true,
    customLoggersToRemove = [],
    removeAllComments = true,
  } = options;

  const originalSize = code.length;
  let optimizedCode = code; // Start with original code
  const actionsTakenLog = [];

  if (!code || code.trim() === "") {
    actionsTakenLog.push("Skipped: File content is empty.");
    return {
      optimizedCode: "",
      actionsTakenLog,
      originalSize,
      finalSize: 0,
    };
  }

  try {
    const compressOptions = {
      dead_code: true, // Removes unreachable code
      unused: true, // Removes unused local variables & functions.
      // `toplevel: false` (default) makes this safer for Shopify themes
      // as it focuses on local/scoped unused entities.
      conditionals: true, // Optimizes if/else and conditional expressions
      sequences: true, // Joins consecutive simple statements
      booleans: true, // Optimizes boolean expressions
      if_return: true, // Optimizes if/return and if/continue
      join_vars: true, // Joins consecutive var statements
      drop_console: removeConsoleLogs, // Removes console.* calls
      pure_funcs: customLoggersToRemove, // Removes calls to these functions if their return value is not used
      passes: 3, // More passes for thoroughness
      // toplevel: false,     // Explicitly false or relying on default. Crucial for safety with `unused:true`
      // in Shopify themes to avoid removing globally used functions
      // that Terser can't see calls to from Liquid.
    };

    const outputOptions = {
      beautify: true, // Ensures unnecessary spaces and newlines are removed
      comments: removeAllComments ? false : "some", // 'false' removes all comments
    };

    const terserResult = await minify(code, {
      // Minify original 'code'
      mangle: {
        reserved: ["Shopify", "theme", "$", "jQuery"], // Protect critical globals
      },
      compress: compressOptions,
      output: outputOptions,
      sourceMap: false,
    });

    if (terserResult.error) {
      actionsTakenLog.push(
        `Terser: Warning during optimization - ${terserResult.error.message}`
      );
      // Keep original code if Terser reports an error but still produces some output
      optimizedCode = code; // Default to original on error
      if (terserResult.code) optimizedCode = terserResult.code; // Use output if available despite error
    } else if (terserResult.code) {
      optimizedCode = terserResult.code; // Assign the optimized code
    } else {
      // Should not happen if no error, but as a fallback
      actionsTakenLog.push(
        `Terser: No code returned from minification. Kept original.`
      );
      optimizedCode = code;
    }

    // Logging based on comparison and options
    const finalSize = optimizedCode.length;
    const savedBytes = originalSize - finalSize;

    if (finalSize < originalSize) {
      actionsTakenLog.push(
        `Terser: Optimized code, saved ${savedBytes} bytes.`
      );
    } else if (originalSize === finalSize && code !== optimizedCode) {
      actionsTakenLog.push(
        `Terser: Code transformed (e.g., comments/whitespace removed) but size remained the same.`
      );
    } else if (finalSize > originalSize) {
      actionsTakenLog.push(
        `Terser: Warning - Optimized code is larger (${finalSize}B) than original (${originalSize}B). Reverting to original code.`
      );
      optimizedCode = code; // Revert if it got larger
    } else {
      actionsTakenLog.push(
        `Terser: No significant optimization or change detected.`
      );
    }

    // Specific logging for targeted removals (heuristic check on original code)
    if (
      removeConsoleLogs &&
      code.includes("console.") &&
      (!optimizedCode.includes("console.") || finalSize < originalSize)
    ) {
      actionsTakenLog.push(`Terser: Targeted removal of console.* calls.`);
    }
    if (
      customLoggersToRemove.length > 0 &&
      customLoggersToRemove.some((logger) => code.includes(logger)) &&
      (finalSize < originalSize ||
        !customLoggersToRemove.some((logger) => optimizedCode.includes(logger)))
    ) {
      actionsTakenLog.push(
        `Terser: Targeted removal of custom logger calls (${customLoggers.join(
          ", "
        )}).`
      );
    }
    if (
      removeAllComments &&
      (code.includes("//") || code.includes("/*")) &&
      (finalSize < originalSize ||
        (!optimizedCode.includes("//") && !optimizedCode.includes("/*")))
    ) {
      actionsTakenLog.push(`Terser: Targeted removal of comments.`);
    }
    if (outputOptions.beautify === false && code !== optimizedCode) {
      actionsTakenLog.push(
        `Terser: Compacted code (removed unnecessary whitespace/newlines).`
      );
    }
  } catch (error) {
    actionsTakenLog.push(
      `Terser: Critical failure during optimization - ${error.message}. Original code kept.`
    );
    console.error(`Terser critical failure for ${filename}:`, error);
    optimizedCode = code; // Ensure original code is kept on critical failure
  }

  return {
    optimizedCode, // This will be the original code if optimization failed or made it larger
    actionsTakenLog,
    originalSize,
    finalSize: optimizedCode.length, // Recalculate finalSize based on potentially reverted code
  };
}

/**
 * Processes an array of JS files using only Terser for optimization.
 *
 * @param {Array<{filename: string, content: string}>} jsFiles - Array of JS file objects.
 * @param {Object} [processingOptions] - Options for Terser optimization.
 * @returns {Promise<Array<{filename: string, originalContent: string, optimizedContent: string, actionsTakenLog: Array<string>, originalSize: number, finalSize: number, hasChanged: boolean}>>}
 */
export async function processJsFilesWithTerser(
  jsFiles,
  processingOptions = {}
) {
  const results = [];

  for (const jsFile of jsFiles) {
    const { optimizedCode, actionsTakenLog, originalSize, finalSize } =
      await optimizeSingleJsFileWithTerser(
        jsFile.content,
        jsFile.filename,
        processingOptions
      );

    results.push({
      filename: jsFile.filename,
      originalContent: jsFile.content, // Store original for comparison
      optimizedContent: optimizedCode,
      actionsTakenLog,
      originalSize,
      finalSize,
      // Content has changed if sizes are different, OR if sizes are same but content strings differ (e.g. only comments removed)
      // AND ensure optimized code is not larger than original.
      hasChanged: finalSize <= originalSize && optimizedCode !== jsFile.content,
    });
  }

  return results;
}
