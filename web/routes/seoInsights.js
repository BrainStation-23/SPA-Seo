import express from "express";
import {
  getSeoInsightsController,
  toggleInstantPages,
  updateSpeedEffects,
} from "../controllers/seoInsights.js";

const router = express.Router();

router.get("/insights", getSeoInsightsController);
router.post("/instant-pages", toggleInstantPages);
router.post("/speed-effect", updateSpeedEffects);

export default router;
