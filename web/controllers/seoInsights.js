import shopify from "../shopify.js";
import SpeedInsights from "../models/speedInsights.js";
import { GetThemeFile, UpdateThemeFiles } from "../graphql/theme.js";
import { queryDataWithVariables } from "../utils/getQueryData.js";
import { removeUnusedCSS } from "../services/optimizeCss.js";

// import {}

export const getSeoInsightsController = async (req, res, next) => {
  const { device = "desktop" } = req.query;
  const url = `https://${res.locals.shopify.session?.shop}`;

  if (!["desktop", "mobile"].includes(device)) {
    return res
      .status(400)
      .json({ error: 'Device must be "desktop" or "mobile"' });
  }

  try {
    const result = await fetchPageSpeedData(url, device);
    res.json(result);
  } catch (error) {
    console.error(
      "PageSpeed API Error:",
      error?.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch SEO score" });
  }
};

// Utility to fetch PageSpeed data
async function fetchPageSpeedData(url, strategy = "desktop") {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&key=${process.env.GOOGLE_API_KEY}&strategy=${strategy}`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  const lighthouse = data?.lighthouseResult;
  const audits = lighthouse?.audits;

  return {
    device: strategy,
    score: Math.round(lighthouse.categories.performance.score * 100),
    performance: {
      speedIndex: audits["speed-index"].displayValue,
      firstContentfulPaint: audits["first-contentful-paint"].displayValue,
      largestContentfulPaint: audits["largest-contentful-paint"].displayValue,
      cumulativeLayoutShift: audits["cumulative-layout-shift"].displayValue,
      totalBlockingTime: audits["total-blocking-time"].displayValue,
    },
  };
}

// UPDATE SpeedInsights by platformStoreURL
export const updateSpeedEffects = async (req, res) => {
  try {
    const platformStoreURL = res.locals.shopify.session?.shop;
    const updateData = req.body;

    if (!platformStoreURL) {
      return res
        .status(400)
        .json({ message: "platformStoreURL is required in params." });
    }

    const updated = await SpeedInsights.findOneAndUpdate(
      { platformStoreURL },
      { $set: updateData, $setOnInsert: { platformStoreURL } },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const toggleInstantPages = async (req, res, next) => {
  try {
    const addInstantPage = req.body.activate;
    const checkInstantPagesScriptRegex =
      /<script\b[^>]*\bsrc=(['"])\/\/instant\.page\/[^'"]+\1[^>]*><\/script>/i;
    const instantPagesScript = `<script src="//instant.page/5.2.0" type="module" integrity="sha384-jnZyxPjiipYXnSU0ygqeac2q7CVYMbh84q0uHVRRxEtvFPiQYbXWUorga2aqZJ0z"></script>`;

    const getThemeFileResponse = await queryDataWithVariables(
      res,
      GetThemeFile,
      { count: 1, role: "MAIN", filename: "layout/theme.liquid" }
    );
    const themeId = getThemeFileResponse.data.themes.edges[0].node.id;
    const themeFileText =
      getThemeFileResponse.data.themes.edges[0].node.files.edges[0].node.body
        .content;

    const alreadyActivatedInstantPages =
      checkInstantPagesScriptRegex.test(themeFileText);

    let responseMessage = "Not applied anything";
    if (addInstantPage && !alreadyActivatedInstantPages) {
      const updatedThemeFile = themeFileText.replace(
        `</body>`,
        `${instantPagesScript} </body>`
      );
      await queryDataWithVariables(res, UpdateThemeFiles, {
        themeId,
        files: [
          {
            filename: "layout/theme.liquid",
            body: {
              type: "TEXT",
              value: updatedThemeFile,
            },
          },
        ],
      });
      responseMessage = "added";
    }
    if (!addInstantPage && alreadyActivatedInstantPages) {
      const updatedThemeFile = themeFileText.replace(
        checkInstantPagesScriptRegex,
        ""
      );
      await queryDataWithVariables(res, UpdateThemeFiles, {
        themeId,
        files: [
          {
            filename: "layout/theme.liquid",
            body: {
              type: "TEXT",
              value: updatedThemeFile,
            },
          },
        ],
      });
      responseMessage = "removed";
    }

    res.status(200).json(responseMessage);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to optimize theme files",
      error: error.message,
    });
  }
};

export const speedInsightsController = async (req, res, next) => {
  try {
    // Get theme.liquid file using the GET_THEME_FILE query
    const themeFileResponse = await queryDataWithVariables(res, GetThemeFile, {
      count: 1,
      role: "MAIN",
      filename: "layout/theme.liquid",
    });

    const themeId = themeFileResponse.data.themes.edges[0].node.id;
    const themeFiles = themeFileResponse.data.themes.edges[0].node.files.edges;

    if (themeFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Theme.liquid file not found",
      });
    }

    const themeLiquidFile = themeFiles[0].node;
    const originalContent = themeLiquidFile.body.content;

    if (originalContent.includes("seofy-lazy-script")) {
      return res.status(200).json({
        success: true,
        message: "Lazy loading is already applied",
      });
    }

    const styleTag = `
  <style id="seofy-lazy-styles">
    .seofy-img-lazy-bg {
      background-color: #f0f0f0;
      transition: background-color 0.3s ease;
    }
    .seofy-img-loaded {
      background-color: transparent;
    }
  </style>`;

    const scriptTag = `
  <script id="seofy-lazy-script">
    document.addEventListener("DOMContentLoaded",(function(){if(document.querySelectorAll('img:not([loading="lazy"])').forEach((function(t){t.setAttribute("loading","lazy")})),document.querySelectorAll("img").forEach((function(t){t.classList.add("seofy-img-lazy-bg"),t.addEventListener("load",(function(){this.classList.add("seofy-img-loaded")})),t.complete&&t.classList.add("seofy-img-loaded")})),document.querySelectorAll("iframe").forEach((function(t){if(!t.hasAttribute("data-src")){var e=t.getAttribute("src");e&&(t.setAttribute("data-src",e),t.removeAttribute("src"),t.classList.add("lazy-iframe"))}})),document.querySelectorAll("video").forEach((function(t){t.classList.contains("lazy-video")||(t.setAttribute("preload","none"),t.classList.add("lazy-video"))})),"IntersectionObserver"in window){var t={rootMargin:"50px 0px",threshold:0},e=new IntersectionObserver((function(t,e){t.forEach((function(t){if(t.isIntersecting){var r=t.target,o=r.getAttribute("data-src");o&&(r.setAttribute("src",o),r.removeAttribute("data-src"),e.unobserve(r))}}))}),t),r=new IntersectionObserver((function(t,e){t.forEach((function(t){if(t.isIntersecting){var r=t.target;"none"===r.getAttribute("preload")&&(r.setAttribute("preload","metadata"),r.hasAttribute("autoplay")&&r.play().catch((function(){})),e.unobserve(r))}}))}),t);document.querySelectorAll(".lazy-iframe").forEach((function(t){e.observe(t)})),document.querySelectorAll(".lazy-video").forEach((function(t){r.observe(t)}))}else setTimeout((function(){document.querySelectorAll(".lazy-iframe").forEach((function(t){var e=t.getAttribute("data-src");e&&(t.setAttribute("src",e),t.removeAttribute("data-src"))})),document.querySelectorAll(".lazy-video").forEach((function(t){"none"===t.getAttribute("preload")&&t.setAttribute("preload","metadata")}))}),2e3)}));
  </script>`;

    const updatedContent = originalContent.replace(
      "</head>",
      `${styleTag}\n${scriptTag}\n</head>`
    );

    // Save the updated file
    const updateResponse = await queryDataWithVariables(res, UpdateThemeFiles, {
      themeId,
      files: [
        {
          filename: themeLiquidFile.filename,
          body: {
            type: "TEXT",
            value: updatedContent,
          },
        },
      ],
    });

    if (updateResponse.data.themeFilesUpsert.userErrors.length > 0) {
      throw updateResponse.data.themeFilesUpsert.userErrors;
    }

    return res.status(200).json({
      success: true,
      message: "Lazy loading applied successfully",
    });
  } catch (error) {
    console.error("Speed Insights Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to optimize theme files",
      error: error.message,
    });
  }
};

export const optimizeCssForLiveTheme = async (req, res, next) => {
  try {
    removeUnusedCSS(res);
    return res.status(200).json({
      success: true,
      message: "Optimized CSS for live theme files successfully",
    });
  } catch (error) {
    console.error("Optimize CSS Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to optimize css for theme files",
      error: error.message,
    });
  }
};
