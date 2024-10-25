import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import GDPRWebhookHandlers from "./gdpr.js";
import productsRoute from "./routes/products.js";
import collectionsRoute from "./routes/collections.js";
import metafieldsRoute from "./routes/metafields.js";
import seoInsightsRoute from "./routes/seoInsights.js";
import homeRoute from "./routes/home.js";
import blogRoute from "./routes/blog.js";
import jsonLdRoute from "./routes/Jsonld.js";
import ImageOptimizerRoute from "./routes/image.optimizer.js";
import sitemapRoute from "./routes/htmlsitemap.js";
import { errorRouter, updateErrorInsightsRouter } from "./routes/404error.js";
import { templates } from "./utils/templates.js";
import { GetShopMetafield } from "./graphql/metafields.js";
import { getAccessTokenForShop } from "./utils/getShopAccessToken.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
app.use(express.json());

app.use("/api/404-error", updateErrorInsightsRouter);

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.

app.use("/api/*", shopify.validateAuthenticatedSession());

app.get("/api/uninstall", async (_req, res) => {
  try {
    console.log("uninstall");
    const client = new shopify.api.clients.Graphql({
      apiVersion: "2024-10",
      session: res.locals.shopify.session,
    });

    let initialData = await client.query({
      data: {
        query: `
          query GetShopMetafield {
            shop {
              metafield(key: "json-ld-saved-history", namespace: "bs-23-seo-app") {
                id
                namespace
                key
                value
              }
            }
            shop_defs: metafieldDefinitions(
              first: 250
              ownerType: SHOP
              namespace: "bs-23-seo-app"
            ) {
              edges {
                node {
                  id
                  key
                  namespace
                }
              }
            }
            product_defs: metafieldDefinitions(
              first: 250
              ownerType: PRODUCT
              namespace: "bs-23-seo-app"
            ) {
              edges {
                node {
                  id
                  key
                  namespace
                }
              }
            }
            article_defs: metafieldDefinitions(
              first: 250
              ownerType: ARTICLE
              namespace: "bs-23-seo-app"
            ) {
              edges {
                node {
                  id
                  key
                  namespace
                }
              }
            }
            collection_defs: metafieldDefinitions(
              first: 250
              ownerType: COLLECTION
              namespace: "bs-23-seo-app"
            ) {
              edges {
                node {
                  id
                  key
                  namespace
                }
              }
            }
          }
        `,
      },
    });
    const data = initialData.body.data;
    const previousThemeCodes = JSON.parse(
      initialData.body.data.shop.metafield.value
    );

    const metafieldDefinitionIds = [];
    const deleteQuery = (id, index, owner) => `
    ${owner}_${index}: metafieldDefinitionDelete(
      id: "${id}"
      deleteAllAssociatedMetafields: true
    ) {
      deletedDefinitionId
      userErrors {
        field
        message
        code
      }
    }`;

    data.shop_defs.edges.forEach(({ node }, index) => {
      console.log("shop", node.key);
      metafieldDefinitionIds.push(deleteQuery(node.id, index, "shop"));
    });
    data.product_defs.edges.forEach(({ node }, index) => {
      console.log("product", node.key);
      metafieldDefinitionIds.push(deleteQuery(node.id, index, "product"));
    });
    data.article_defs.edges.forEach(({ node }, index) => {
      console.log("article", node.key);
      metafieldDefinitionIds.push(deleteQuery(node.id, index, "article"));
    });
    data.collection_defs.edges.forEach(({ node }, index) => {
      console.log("collection", node.key);
      metafieldDefinitionIds.push(deleteQuery(node.id, index, "collection"));
    });

    const deleteAllMetafieldsQuery = metafieldDefinitionIds.join("");

    const themeFilesMap = new Map();
    let themeQueryResponse = await client.query({
      data: {
        query: `
                  query GetDevTheme {
                    themes(first: 1, roles: MAIN) {
                      edges {
                        node {
                          id
                          files(
                            first: 6
                            filenames: [ "layout/theme.liquid", "sections/main-product.liquid", "sections/main-article.liquid", "sections/header.liquid", "sections/main-collection-product-grid.liquid", "${templates.seoJsonld}"]
                          ) {
                            edges {
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
                          }
                        }
                      }
                    }
                  }
                `,
      },
    });
    const themeId = themeQueryResponse.body.data.themes.edges[0].node.id;
    themeQueryResponse.body.data.themes.edges[0].node.files.edges.forEach(
      ({ node }) => {
        themeFilesMap.set(node.filename, node.body.content);
      }
    );

    // Revert the theme changes
    const filesToBeReverted = [
      {
        filename: "layout/theme.liquid",
        body: {
          type: "TEXT",
          value: themeFilesMap
            .get("layout/theme.liquid")
            .replace("{% render 'seofy-complete-seo-expert' %}", ""),
        },
      },
      {
        filename: "sections/main-product.liquid",
        body: {
          type: "TEXT",
          value: themeFilesMap
            .get("sections/main-product.liquid")
            .replace(
              previousThemeCodes["sections/main-product.liquid"].updated_code,
              previousThemeCodes["sections/main-product.liquid"].prev_code
            ),
        },
      },
      {
        filename: "sections/main-article.liquid",
        body: {
          type: "TEXT",
          value: themeFilesMap
            .get("sections/main-article.liquid")
            .replace(
              previousThemeCodes["sections/main-article.liquid"].updated_code,
              previousThemeCodes["sections/main-article.liquid"].prev_code
            ),
        },
      },
      {
        filename: "sections/main-collection-product-grid.liquid",
        body: {
          type: "TEXT",
          value: themeFilesMap
            .get("sections/main-collection-product-grid.liquid")
            .replace(
              previousThemeCodes["sections/main-collection-product-grid.liquid"]
                .updated_code,
              previousThemeCodes["sections/main-collection-product-grid.liquid"]
                .prev_code
            ),
        },
      },
      {
        filename: "sections/header.liquid",
        body: {
          type: "TEXT",
          value: themeFilesMap
            .get("sections/header.liquid")
            .replace(
              previousThemeCodes["sections/header.liquid"].updated_code,
              previousThemeCodes["sections/header.liquid"].prev_code
            ),
        },
      },
    ];

    // Delete snippet files
    const filesToBeDeleted = Object.entries(templates).map(
      ([key, value]) => value
    );

    function wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const metafieldCleanupResponse = await client.query({
      data: {
        query: `mutation ThemeCleanupMutation {
                  ${deleteAllMetafieldsQuery}
                }`,
      },
    });

    console.log("ok");
    console.log(JSON.stringify(metafieldCleanupResponse.body.data));

    await wait(2000);
    const cleanupResponse = await client.query({
      data: {
        variables: {
          themeId: themeId,
          filesToBeReverted: filesToBeReverted,
        },
        query: `mutation CleanupMutation($themeId: ID!, $filesToBeReverted: [OnlineStoreThemeFilesUpsertFileInput!]!) {
                    themeFilesUpsert(files: $filesToBeReverted, themeId: $themeId) {
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
      },
    });

    console.log("ok");
    console.log(JSON.stringify(cleanupResponse.body));

    await wait(2000);
    const themeFilesDelete = await client.query({
      data: {
        variables: {
          themeId: themeId,
          filesToBeDeleted: filesToBeDeleted,
        },
        query: `mutation ThemeFilesDeleteMutation($themeId: ID!, $filesToBeDeleted: [String!]!) {
                  themeFilesDelete(files: $filesToBeDeleted, themeId: $themeId) {
                      deletedThemeFiles {
                        filename
                      }
                      userErrors {
                        field
                        message
                      }
                    }
                  }`,
      },
    });

    console.log("ok");
    console.log(JSON.stringify(themeFilesDelete.body.data));

    return res.status(200).send("uninstall");
  } catch (error) {
    console.log("error in uninstall");
    console.log(error);
    return res.status(400).send("uninstall");
  }
});

app.get("/api/shop", async (_req, res) => {
  const response = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });

  let shop = {
    id: response?.data[0]?.id,
    name: response.data[0]?.name,
    email: response.data[0]?.email,
    currencyCode: response.data[0]?.currency,
    domain: response.data[0]?.domain,
  };

  res.status(200).send(shop);
});

app.use("/api/product", productsRoute);
app.use("/api/collection", collectionsRoute);
app.use("/api/metafields", metafieldsRoute);
app.use("/api/seo", seoInsightsRoute);
app.use("/api/home", homeRoute);
app.use("/api/blog", blogRoute);
app.use("/api/image-optimizer", ImageOptimizerRoute);
app.use("/api/error", errorRouter);
app.use("/api/html-sitemap", sitemapRoute);
app.use("/api/jsonld", jsonLdRoute);

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
