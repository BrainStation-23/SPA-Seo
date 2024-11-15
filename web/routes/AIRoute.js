import express from "express";
import {
  aiSeoContentController,
  aiSeoSingleContent,
} from "../controllers/AIController.js";

const router = express.Router();

router.post("/seo-generation", aiSeoContentController);
router.post("/single-seo", aiSeoSingleContent);

export default router;
