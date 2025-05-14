import express from "express";
import {
  getSeoInsightsController,
  toggleInstantPages,
  updateSpeedEffects,
  speedInsightsController,
  minificationDeferController,
} from "../controllers/seoInsights.js";

const router = express.Router();

router.get("/insights", getSeoInsightsController);
router.post("/instant-pages", toggleInstantPages);
router.post("/speed-effect", updateSpeedEffects);
router.post("/lazy-loading", speedInsightsController);
router.post("/minification-defer", minificationDeferController);

export default router;
