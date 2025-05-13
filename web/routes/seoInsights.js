import express from "express";
import {
  getSeoInsightsController,
  updateSpeedEffects,
} from "../controllers/seoInsights.js";

const router = express.Router();

router.get("/insights", getSeoInsightsController);
router.post("/speed-effect", updateSpeedEffects);

export default router;
