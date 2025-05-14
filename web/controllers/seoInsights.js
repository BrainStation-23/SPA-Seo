import shopify from "../shopify.js";
import { GetThemeFile, UpdateThemeFiles, GetAllThemeFiles } from "../graphql/theme.js";
import SpeedInsights from "../models/speedInsights.js";

export const getSeoInsightsController = async (req, res, next) => {
  try {
    const apikey = "AIzaSyAEu1z7QmLwZBGCvyoU6n3Nin8iTfqan-A";

    const shop = await shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
      fields: "id,name,myshopify_domain,domain",
    });

    const product = await shopify.api.rest.Product.all({
      session: res.locals.shopify.session,
      limit: 1,
      status: "active",
      fields: "id,handle,title",
    });

    const collection = await shopify.api.rest.CustomCollection.all({
      session: res.locals.shopify.session,
      fields: "id,title,handle",
      limit: 1,
    });

    const homeUrl = `https://${shop?.data?.[0]?.domain}`;
    const productURl = `${homeUrl}/product/${product?.data?.[0]?.handle}`;
    const collectionURl = `${homeUrl}/collection/${collection?.data?.[0]?.handle}`;

    // Run all requests in parallel
    const [homeResponse, productResponse, collectionResponse] =
      await Promise.all([
        fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
            homeUrl
          )}&category=SEO&key=${apikey}`
        ),
        fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
            productURl
          )}&category=SEO&key=${apikey}`
        ),
        fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
            collectionURl
          )}&category=SEO&key=${apikey}`
        ),
      ]);

    const homeResult = await homeResponse.json();
    const productResult = await productResponse.json();
    const collectionResult = await collectionResponse.json();

    const results = [
      {
        url: homeUrl,
        seoScore: homeResult?.lighthouseResult?.categories?.seo?.score * 100,
        page: "Home Page",
      },
      {
        url: productURl,
        seoScore: productResult?.lighthouseResult?.categories?.seo?.score * 100,
        page: "Product Page",
      },
      {
        url: collectionURl,
        seoScore:
          collectionResult?.lighthouseResult?.categories?.seo?.score * 100,
        page: "Collection Page",
      },
    ];

    return res.status(200).json(results);
  } catch (err) {
    console.log("🚀 ~ getSeoInsightsController ~ Error:", err);
    res.status(400).json({ error: err.message });
  }
};

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
    const client = new shopify.api.clients.Graphql({
      apiVersion: "2025-01",
      session: res.locals.shopify.session,
    });

    const getThemeFileResponse = await client.request(GetThemeFile, {
      variables: { count: 1, role: "MAIN", filename: "layout/theme.liquid" },
    });
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
      await client.request(UpdateThemeFiles, {
        variables: {
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
        },
      });
      responseMessage = "added";
    }
    if (!addInstantPage && alreadyActivatedInstantPages) {
      const updatedThemeFile = themeFileText.replace(
        checkInstantPagesScriptRegex,
        ""
      );
      await client.request(UpdateThemeFiles, {
        variables: {
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
        },
      });
      responseMessage = "removed";
    }

    res.status(200).json(responseMessage);
  } catch (error) {
    throw error;
  }
};

export const speedInsightsController = async (req, res, next) => {
  try {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({
      apiVersion: "2025-01",
      session,
    });

    // Get theme.liquid file using the GET_THEME_FILE query
    const themeFileResponse = await client.request(GetThemeFile, {
      variables: {
        count: 1,
        role: "MAIN",
        filename: "layout/theme.liquid",
      },
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
    
    if (originalContent.includes('seofy-lazy-script')) {
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
    const updateResponse = await client.request(UpdateThemeFiles, {
      variables: {
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
      },
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

export const minificationDeferController = async (req, res, next) => {
  try {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({
      apiVersion: "2025-01",
      session,
    });
    
    const allThemeFiles = [];
    let hasNextPage = true;
    let cursor = null;
    const PER_PAGE = 250;  
    let themeId;

    while (hasNextPage) {
      const getAllThemeFilesResponse = await client.request(GetAllThemeFiles, {
        variables: {
          count: PER_PAGE,
          after: cursor
        },
      });
      
      // Store the theme ID from the first response
      if (!themeId && getAllThemeFilesResponse.data.themes.edges.length > 0) {
        themeId = getAllThemeFilesResponse.data.themes.edges[0].node.id;
      }

      const themeFiles = getAllThemeFilesResponse.data.themes.edges[0].node.files;
      const fileEdges = themeFiles.edges;
      allThemeFiles.push(...fileEdges.map(edge => edge.node));

      const pageInfo = themeFiles.pageInfo;
      hasNextPage = pageInfo.hasNextPage;

      if (hasNextPage) {
        cursor = pageInfo.endCursor;
      }
    }
    console.log("theme id", themeId);
    console.log('allThemeFiles size', allThemeFiles.length);
    
    return res.status(200).json({
      success: true,
      message: "Theme files retrieved successfully",
    });
    
  } catch (error) {
    console.error("Error in minificationDeferController:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve theme files",
      error: error.message
    });
  }
};
