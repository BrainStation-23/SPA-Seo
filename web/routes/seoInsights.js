import express from "express";
import {
  getSeoInsightsController,
  toggleInstantPages,
} from "../controllers/seoInsights.js";

const router = express.Router();

router.get("/insights", getSeoInsightsController);
router.post("/instant-pages", toggleInstantPages);

export default router;
