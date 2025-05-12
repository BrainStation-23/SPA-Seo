import shopify from "../shopify.js";

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

    // Get theme ID first
    const themeIdResponse = await client.request(`
            query GetThemeId {
                themes(first: 1, roles: MAIN) {
                    edges {
                        node {
                            id
                        }
                    }
                }
            }
        `);

    const themeId = themeIdResponse.data.themes.edges[0].node.id;

    // Fetch all files with pagination
    const allThemeFiles = [];
    let hasNextPage = true;
    let cursor = null;

    while (hasNextPage) {
      const afterParam = cursor ? `, after: "${cursor}"` : "";
      const paginatedFilesResponse = await client.request(`
                query GetThemeFiles {
                    theme(id: "${themeId}") {
                        files(first: 100${afterParam}) {
                            edges {
                                cursor
                                node {
                                    filename
                                    size
                                    body {
                                        ... on OnlineStoreThemeFileBodyText {
                                            content
                                        }
                                    }
                                    checksumMd5
                                    contentType
                                }
                            }
                            pageInfo {
                                hasNextPage
                            }
                        }
                    }
                }
            `);

      const fileEdges = paginatedFilesResponse.data.theme.files.edges;
      allThemeFiles.push(...fileEdges);

      hasNextPage = paginatedFilesResponse.data.theme.files.pageInfo.hasNextPage;

      if (hasNextPage && fileEdges.length > 0) {
        cursor = fileEdges[fileEdges.length - 1].cursor;
      }

      console.log(`🚀 ~ Fetched batch of ${fileEdges.length} files. More pages: ${hasNextPage}`);
    }


    const optimizedFiles = await analyzeAndOptimizeFiles(allThemeFiles);

    // Update theme files with optimizations
    const updateResponse = await client.request(
      `
            mutation EditThemeFiles($files: [OnlineStoreThemeFilesUpsertFileInput!]!, $themeId: ID!) {
                themeFilesUpsert(files: $files, themeId: $themeId) {
                    job {
                        id
                        done
                    }
                    upsertedThemeFiles {
                        filename
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }`,
      {
        variables: {
          themeId: themeId,
          files: optimizedFiles,
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
        optimizedFilesCount: optimizedFiles.length,
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

async function analyzeAndOptimizeFiles(themeFiles) {
  const optimizedFiles = [];
  const startTime = performance.now();

  for (const { node } of themeFiles) {
    if (node.contentType !== "text/css" && node.contentType !== "application/json") {
      const optimizedContent = await optimizeFileContent(node.body.content, node.filename);
      if (optimizedContent !== node.body.content) {
        optimizedFiles.push({
          filename: node.filename,
          body: {
            type: "TEXT",
            value: optimizedContent,
          },
        });
      }
    }
  }

  const endTime = performance.now();
  console.log(`File optimization completed in ${endTime - startTime}ms`);
  return optimizedFiles;
}

async function optimizeFileContent(content, filename) {
  let optimizedContent = content;

  // Add lazy loading to images
  optimizedContent = optimizedContent.replace(/<img([^>]*)>/g, (match, attributes) => {
    if (!attributes.includes("loading=")) {
      return `<img${attributes} loading="lazy">`;
    }
    return match;
  });

  return optimizedContent;
}
