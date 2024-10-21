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
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";

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
app.post("/api/cleanup", async (req, res) => {
  console.log("cleanup");
  const { domain, myshopify_domain } = req.body;
  const database = new SQLiteSessionStorage(`${process.cwd()}/database.sqlite`);
  const [session] = await database.findSessionsByShop(myshopify_domain);
  const client = new shopify.api.clients.Graphql({
    session,
  });

  const response = await client.query({
    data: {
      variables: {
        files: [""],
        themeId: "",
      },
      query: `
        mutation themeFilesDelete($files: [String!]!, $themeId: ID!) {
          themeFilesDelete(files: $files, themeId: $themeId) {
            deletedThemeFiles {
              # OnlineStoreThemeFileOperationResult fields
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
    },
  });

  console.log(session);
  console.log(client);
  console.log(response.body);

  return res.status(200).send("cleanup");
});

app.use("/api/*", shopify.validateAuthenticatedSession());

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
