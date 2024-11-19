import express from "express";
import {
  getErrorInsightsContent,
  updateErrorInsightsSeo,
  createAutoRedirectController,
  autoRedirectListController,
  editAutoRedirectController,
} from "../controllers/404error.js";
import { verifyShopifySignature } from "../middleware/validateStorefront.js";

export const errorRouter = express.Router();
export const updateErrorInsightsRouter = express.Router();

errorRouter.get("/insights", getErrorInsightsContent);
errorRouter.get("/auto-redirect/list", autoRedirectListController);
errorRouter.post("/auto-redirect/create", createAutoRedirectController);
errorRouter.post("/auto-redirect/edit/:id", editAutoRedirectController);
updateErrorInsightsRouter.post(
  "/update-error-insights",
  verifyShopifySignature,
  updateErrorInsightsSeo
);
