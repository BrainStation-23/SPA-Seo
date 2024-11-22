import express from "express";
import {
  aiSeoContentController,
  aiSeoSingleContent,
  aiBlogContentController,
} from "../controllers/AIController.js";

const router = express.Router();

router.post("/seo-generation", aiSeoContentController);
router.post("/single-seo", aiSeoSingleContent);
router.post("/blog-generation", aiBlogContentController);

export default router;
