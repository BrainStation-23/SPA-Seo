import shopify from "../shopify.js";
import { GET_THEME_ID, GET_THEME_ALL_FILES, EDIT_THEME_FILES } from "../graphql/theme.js";

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
    const [homeResponse, productResponse, collectionResponse] = await Promise.all([
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
        seoScore: collectionResult?.lighthouseResult?.categories?.seo?.score * 100,
        page: "Collection Page",
      },
    ];

    return res.status(200).json(results);
  } catch (err) {
    console.log("🚀 ~ getSeoInsightsController ~ Error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const speedInsightsController = async (req, res, next) => {
  try {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({
      apiVersion: "2025-01",
      session,
    });

    // Get all theme files
    const allThemeFiles = await getAllThemeFiles(client);

    // Analyze and optimize files
    const optimizationResult = await analyzeAndOptimizeFiles(allThemeFiles, client);
    
    // Update theme files with optimizations
    const updateResponse = await client.request(
      EDIT_THEME_FILES,
      {
        variables: {
          themeId: optimizationResult.themeId,
          files: optimizationResult.optimizedFiles,
        },
      }
    );

    if (updateResponse.data.themeFilesUpsert.userErrors.length > 0) {
      throw updateResponse.data.themeFilesUpsert.userErrors;
    }

    return res.status(200).json({
      success: true,
      message: "Theme files optimized successfully",
      data: {
        optimizedFilesCount: optimizationResult.optimizedFiles.length,
        totalFilesProcessed: allThemeFiles.length,
      },
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

// Get all theme files with pagination
async function getAllThemeFiles(client) {
  const themeIdResponse = await client.request(GET_THEME_ID);

  const themeId = themeIdResponse.data.themes.edges[0].node.id;
  
  // Fetch all files with pagination
  const allThemeFiles = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const paginatedFilesResponse = await client.request(GET_THEME_ALL_FILES(themeId, cursor));

    const fileEdges = paginatedFilesResponse.data.theme.files.edges;
    allThemeFiles.push(...fileEdges);

    hasNextPage = paginatedFilesResponse.data.theme.files.pageInfo.hasNextPage;

    if (hasNextPage && fileEdges.length > 0) {
      cursor = fileEdges[fileEdges.length - 1].cursor;
    }
  }
  
  allThemeFiles.themeId = themeId;
  return allThemeFiles;
}

async function analyzeAndOptimizeFiles(themeFiles, client) {
  const optimizedFiles = [];
  const themeId = themeFiles.themeId;
  
  // Check if we need to add the lazy loading script
  let needsLazyScript = false;
  let hasLazyScript = false;
  let themeLayout = null;
  
  // Check if lazy loading script already exists
  for (const fileEdge of themeFiles) {
    if (fileEdge.node.filename === 'assets/lazy-load-SEOfy.js' || 
        fileEdge.node.filename === 'assets/js/lazy-load-SEOfy.js') {
      hasLazyScript = true;
    }
    
    if (fileEdge.node.filename === 'layout/theme.liquid') {
      themeLayout = fileEdge.node;
    }
  }

  // Process each file
  for (const fileEdge of themeFiles) {
    // Skip if node is undefined
    if (!fileEdge || !fileEdge.node) {
      continue;
    }
    
    const node = fileEdge.node;
    
    // Skip if missing critical properties
    if (!node.body || !node.body.content) {
      continue;
    }
    
    // Skip specific file types
    if (node.contentType === "text/css" || 
        node.contentType === "application/json" ||
        (node.filename && (
          node.filename.endsWith('.css') || 
          node.filename.endsWith('.json') 
         
        ))) {
      continue;
    }

    try {
      const optimizedContent = await optimizeFileContent(node.body.content, node.filename);
      
      // Check if we found iframe or video tags that need lazy loading
      if (optimizedContent.includes('lazy-iframe') || optimizedContent.includes('lazy-video')) {
        needsLazyScript = true;
      }
      
      // Only add files that were changed
      if (optimizedContent && optimizedContent !== node.body.content) {
        optimizedFiles.push({
          filename: node.filename,
          body: {
            type: "TEXT",
            value: optimizedContent,
          },
        });
      }
    } catch (error) {
      console.error(`Error optimizing file ${node.filename}:`, error);
    }
  }

  // Add lazy loading script if needed and not already present
  if (needsLazyScript && !hasLazyScript) {
    optimizedFiles.push({
      filename: 'assets/lazy-load-SEOfy.js',
      body: {
        type: "TEXT",
        value: createLazyLoadScript()
      }
    });
    
    // Add script reference to theme.liquid if not already there
    if (themeLayout && themeLayout.body && themeLayout.body.content && 
        !themeLayout.body.content.includes('lazy-load.js')) {
      const updatedThemeContent = themeLayout.body.content.replace(
        '</head>',
        '  {{ "lazy-load.js" | asset_url | script_tag }}\n</head>'
      );
      
      optimizedFiles.push({
        filename: 'layout/theme.liquid',
        body: {
          type: "TEXT",
          value: updatedThemeContent
        }
      });
    }
  }

  return { optimizedFiles, themeId };
}

async function optimizeFileContent(content, filename) {
  // Check if content is null or undefined
  if (!content) {
    console.log(`Skipping file ${filename} - content is undefined`);
    return content || '';
  }

  let optimizedContent = content;

  try {
    // Add lazy loading to images with a solid color placeholder that only shows during loading
    optimizedContent = optimizedContent.replace(
      /<img(?!\s+loading=)([^>]*?)>/g,
      (match, attributes) => {
        const loadingAttr = 'loading="lazy"';
        let onloadAttr = ' onload="this.style.backgroundColor=\'transparent\'"';
        
        // Handle images with existing style attribute
        if (attributes.includes('style=')) {
          // Find the style attribute and add background-color
          return attributes.replace(
            /style=["']([^"']*)["']/g, 
            (styleMatch, styleContent) => {
              // Add background-color to existing style if not present
              if (!styleContent.includes('background-color')) {
                return `style="${styleContent}; background-color: #f0f0f0;"${onloadAttr}`;
              }
              return styleMatch;
            }
          ).replace('<img', `<img ${loadingAttr}`);
        }
        
        // Add loading="lazy", background placeholder, and onload handler for images without style
        return `<img ${loadingAttr} style="background-color: #f0f0f0;"${onloadAttr}${attributes}>`;
      }
    );

    // Add lazy loading to iframes
    optimizedContent = optimizedContent.replace(
      /<iframe(?!\s+data-src)([^>]*?)\s+src="([^"]+)"/g,
      '<iframe$1 data-src="$2" class="lazy-iframe"'
    );

    // Add lazy loading to videos - handle existing preload attributes
    // First, replace videos that already have a preload attribute
    optimizedContent = optimizedContent.replace(
      /<video([^>]*?)preload=["'](?:auto|metadata)["']([^>]*?)>/g,
      '<video$1preload="none"$2 class="lazy-video">'
    );
    
    // Then handle videos without a preload attribute
    optimizedContent = optimizedContent.replace(
      /<video(?![^>]*?preload=)(?![^>]*?class="lazy-video")([^>]*?)>/g,
      '<video$1 preload="none" class="lazy-video">'
    );
  } catch (error) {
    console.error(`Error processing file ${filename}:`, error);
    return content; // Return original content on error
  }

  return optimizedContent;
}

// Create the JavaScript for lazy loading
function createLazyLoadScript() {
  return `
// Lazy Loading Script for iframes and videos
document.addEventListener('DOMContentLoaded', function() {
  // Check for Intersection Observer API support
  if ('IntersectionObserver' in window) {
    // Options for observer
    const options = {
      rootMargin: '50px 0px',
      threshold: 0
    };
    
    // Lazy load iframes
    const iframeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          const src = iframe.getAttribute('data-src');
          
          if (src) {
            iframe.setAttribute('src', src);
            iframe.removeAttribute('data-src');
            observer.unobserve(iframe);
          }
        }
      });
    }, options);
    
    // Lazy load videos
    const videoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          
          // Start loading the video
          if (video.getAttribute('preload') === 'none') {
            video.setAttribute('preload', 'metadata');
            
            // If video has autoplay, start it when visible
            if (video.hasAttribute('autoplay')) {
              video.play().catch(e => console.log('Autoplay error:', e));
            }
            
            observer.unobserve(video);
          }
        }
      });
    }, options);
    
    // Get all elements to lazy load
    const lazyIframes = document.querySelectorAll('.lazy-iframe');
    const lazyVideos = document.querySelectorAll('.lazy-video');
    
    // Observe each element
    lazyIframes.forEach(iframe => iframeObserver.observe(iframe));
    lazyVideos.forEach(video => videoObserver.observe(video));
  } else {
    // Fallback for browsers without Intersection Observer support
    // Add a small delay to ensure critical content loads first
    setTimeout(() => {
      const lazyIframes = document.querySelectorAll('.lazy-iframe');
      lazyIframes.forEach(iframe => {
        const src = iframe.getAttribute('data-src');
        if (src) {
          iframe.setAttribute('src', src);
          iframe.removeAttribute('data-src');
        }
      });
      
      const lazyVideos = document.querySelectorAll('.lazy-video');
      lazyVideos.forEach(video => {
        if (video.getAttribute('preload') === 'none') {
          video.setAttribute('preload', 'metadata');
        }
      });
    }, 2000);
  }
});`;
}
