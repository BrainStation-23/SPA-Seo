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
import UninstallCleanupRouter from "./routes/uninstall.js";
import { errorRouter, updateErrorInsightsRouter } from "./routes/404error.js";
import imageCompression from "./routes/imageCompression.js";
import AIRouter from "./routes/AIRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
app.use(
  cors({
    origin: "http://127.0.0.1:9292", // Allow requests from your local development server
  })
);
app.use(express.json());
app.use(cookieParser());

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
app.use("/api/insights", updateErrorInsightsRouter);

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
app.use("/api/uninstall", UninstallCleanupRouter);
app.use("/api/image-compression", imageCompression);
app.use("/api/products", productsRoute);
app.use("/api/AI", AIRouter);

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
