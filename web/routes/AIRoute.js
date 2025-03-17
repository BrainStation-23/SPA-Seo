import express from "express";
import {
  aiSeoBulkContent,
  aiSeoContentController,
  aiSeoSingleContent,
} from "../controllers/AIController.js";

const router = express.Router();

router.post("/seo-generation", aiSeoContentController);
router.post("/single-seo", aiSeoSingleContent);
router.post("/product-bulk-seo", aiSeoBulkContent);

export default router;
