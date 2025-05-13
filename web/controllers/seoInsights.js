import shopify from "../shopify.js";
import { GetThemeFile, UpdateThemeFiles } from "../graphql/theme.js";
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

    // Skip if already has lazy loading script
    if (originalContent.includes("seofy-lazy-script")) {
      return res.status(200).json({
        success: true,
        message: "Lazy loading is already applied",
      });
    }

    // Create the lazy loading script
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
    document.addEventListener('DOMContentLoaded', function() {
      // ---- IMAGE HANDLING ----
      
      // Add native lazy loading to all images without it
      document.querySelectorAll('img:not([loading="lazy"])').forEach(function(img) {
        img.setAttribute('loading', 'lazy');
      });
      
      // Add background class to all images
      document.querySelectorAll('img').forEach(function(img) {
        // Add our background class
        img.classList.add('seofy-img-lazy-bg');
        
        // When image loads, add the loaded class
        img.addEventListener('load', function() {
          this.classList.add('seofy-img-loaded');
        });
        
        // For images that are already loaded
        if (img.complete) {
          img.classList.add('seofy-img-loaded');
        }
      });
      
      // ---- IFRAME HANDLING ----
      
      // Find all iframes and convert to lazy loading
      document.querySelectorAll('iframe').forEach(function(iframe) {
        // Skip iframes that are already set up for lazy loading
        if (iframe.hasAttribute('data-src')) return;
        
        // Save original src
        var src = iframe.getAttribute('src');
        if (src) {
          // Set data-src and remove src to prevent loading
          iframe.setAttribute('data-src', src);
          iframe.removeAttribute('src');
          iframe.classList.add('lazy-iframe');
        }
      });
      
      // ---- VIDEO HANDLING ----
      
      // Find all videos and set to lazy loading
      document.querySelectorAll('video').forEach(function(video) {
        // Skip videos that are already lazy loading
        if (video.classList.contains('lazy-video')) return;
        
        // Set preload to none to prevent automatic loading
        video.setAttribute('preload', 'none');
        video.classList.add('lazy-video');
      });
      
      // ---- LAZY LOADING IMPLEMENTATION ----
      
      // Set up Intersection Observer if available
      if ('IntersectionObserver' in window) {
        var options = {
          rootMargin: '50px 0px',
          threshold: 0
        };
        
        // Lazy load iframes
        var iframeObserver = new IntersectionObserver(function(entries, observer) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              var iframe = entry.target;
              var src = iframe.getAttribute('data-src');
              
              if (src) {
                iframe.setAttribute('src', src);
                iframe.removeAttribute('data-src');
                observer.unobserve(iframe);
              }
            }
          });
        }, options);
        
        // Lazy load videos
        var videoObserver = new IntersectionObserver(function(entries, observer) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              var video = entry.target;
              
              if (video.getAttribute('preload') === 'none') {
                video.setAttribute('preload', 'metadata');
                
                if (video.hasAttribute('autoplay')) {
                  video.play().catch(function() {});
                }
                
                observer.unobserve(video);
              }
            }
          });
        }, options);
        
        // Start observing
        document.querySelectorAll('.lazy-iframe').forEach(function(iframe) {
          iframeObserver.observe(iframe);
        });
        
        document.querySelectorAll('.lazy-video').forEach(function(video) {
          videoObserver.observe(video);
        });
      } else {
        // Fallback for browsers without Intersection Observer
        setTimeout(function() {
          document.querySelectorAll('.lazy-iframe').forEach(function(iframe) {
            var src = iframe.getAttribute('data-src');
            if (src) {
              iframe.setAttribute('src', src);
              iframe.removeAttribute('data-src');
            }
          });
          
          document.querySelectorAll('.lazy-video').forEach(function(video) {
            if (video.getAttribute('preload') === 'none') {
              video.setAttribute('preload', 'metadata');
            }
          });
        }, 2000);
      }
    });
  </script>`;

    // Update the theme.liquid file content
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
