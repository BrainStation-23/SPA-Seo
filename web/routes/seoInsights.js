import express from "express";
import {
  getSeoInsightsController,
  toggleInstantPages,
  updateSpeedEffects,
  speedInsightsController,
  optimizeCssForLiveTheme,
  minificationDeferController,
  optimizedLoadingController,
} from "../controllers/seoInsights.js";
import { optimizedLoading } from "../controllers/optimizedLoading.js";
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
router.post("/optimize-css", optimizeCssForLiveTheme);
router.post("/minification-defer", minificationDeferController);
router.post("/optimized-loading", optimizedLoading);

export default router;
