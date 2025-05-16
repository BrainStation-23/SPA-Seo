import express from "express";
import {
  getSeoInsightsController,
  toggleInstantPages,
  updateSpeedEffects,
  speedInsightsController,
} from "../controllers/seoInsights.js";
import { speedInsightsValidationSchema } from "../validators/seoInsights.js";
import validationMiddleware from "../validators/validation.middleware.js";

const router = express.Router();

router.get("/insights", getSeoInsightsController);
router.post("/instant-pages", toggleInstantPages);
router.post(
  "/speed-effect",
  validationMiddleware(speedInsightsValidationSchema),
  updateSpeedEffects
);
router.post("/lazy-loading", speedInsightsController);

export default router;
