import { generate } from "critical";
import { PurgeCSS } from "purgecss";
import themeService from "../services/themeService.js";
import { startPuppeteer } from "../utils/puppeteerUtil.js";

const generateCriticalCss = async (htmlContents, baseUrl) => {
  try {
    const criticalCssResults = [];
    for (let i = 0; i < htmlContents.length; i++) {
      const { url, html } = htmlContents[i];
      const { css, uncritical } = await generate({
        inline: false, // Do not inline critical CSS
        html: html, // The HTML content collected above
        width: 1280,
        height: 800,
        extract: true, // Extract remaining (uncritical) CSS
        base: baseUrl, // Base URL for resolving relative paths
        ignore: [
          "@font-face", // Font declarations are often deferred
          /url\(/, // Background images, cursor URLs etc.
          /::selection/, // Pseudo-elements that aren't critical for initial render
          /::-webkit-scrollbar/, // Browser-specific scrollbar styling
        ],
      });

      criticalCssResults.push({
        url,
        critical: css,
        uncritical: uncritical,
      });
    }
    console.log(
      `[CriticalCSS] Successfully generated critical CSS for ${criticalCssResults.length} URLs.`
    );
    return criticalCssResults;
  } catch (error) {
    console.error("Error generating critical CSS:", error);
    throw error;
  }
};

const updateThemeLiquidWithCriticalCss = async (res, criticalCss) => {
  try {
    const themeFile = await themeService.getThemeFileByFilename(
      res,
      "layout/theme.liquid"
    );
    if (!themeFile) {
      throw new Error(`Theme file layout/theme.liquid not found.`);
    }

    const themeId = themeFile.id;
    const contentForHeaderRegex = /\{\{\s*content_for_header\s*\}\}/g;
    const updatedContent = themeFile.content.replace(
      contentForHeaderRegex,
      `<style>${criticalCss}</style>\n{{ content_for_header }}`
    );

    await themeService.updateThemeAsset(
      res,
      themeId,
      "layout/theme.liquid",
      updatedContent
    );
    console.log(`Successfully updated layout/theme.liquid with critical CSS.`);
  } catch (error) {
    console.error("Error updating theme liquid with critical CSS:", error);
    throw error;
  }
};

export const inlineCriticalCss = async (res, baseUrl, storePassword) => {
  const htmlContents = await startPuppeteer(storePassword, baseUrl, {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
  });
  const criticalCssResults = await generateCriticalCss(htmlContents, baseUrl);
  const allCriticalCss = criticalCssResults
    .map((result) => result.critical)
    .join("\n");
  //   const purgedCssResults = await new PurgeCSS().purge({
  //     content: htmlContents.map((item) => ({
  //       raw: item.html,
  //       extension: "html",
  //     })),
  //     css: [
  //       {
  //         raw: allCriticalCss,
  //         extension: "css",
  //       },
  //     ],
  //     defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
  //   });

  //   console.log(
  //     `[CriticalCSS] Purged CSS results: ${purgedCssResults.length} files processed.`
  //   );
  //   console.log(
  //     `[CriticalCSS] Total critical CSS size after purging: ${purgedCssResults
  //       .map((result) => result.css.length)
  //       .reduce((a, b) => a + b, 0)} bytes.`
  //   );
  //   console.log(purgedCssResults);
  await updateThemeLiquidWithCriticalCss(res, allCriticalCss);

  try {
  } catch (error) {
    console.error("Error in inlineCriticalCss:", error);
    throw error;
  }
};
