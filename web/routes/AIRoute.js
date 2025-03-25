import express from "express";
import {
  aiSeoBulkContent,
  aiSeoContentController,
  aiSeoSingleContent,
  blogGenerateAIContent,
  blogTitleReGenerate,
} from "../controllers/AIController.js";

const router = express.Router();

router.post("/seo-generation", aiSeoContentController);
router.post("/single-seo", aiSeoSingleContent);
router.post("/product-bulk-seo", aiSeoBulkContent);
router.post("/blog-generation", blogGenerateAIContent);
router.post("/blog-title-regeneration", blogTitleReGenerate);

export default router;
