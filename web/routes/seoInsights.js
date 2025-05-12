import express from "express";
import { getSeoInsightsController, speedInsightsController } from "../controllers/seoInsights.js";

const router = express.Router();

router.get("/insights", getSeoInsightsController);
router.post("/lazy-loading", speedInsightsController);

export default router;
