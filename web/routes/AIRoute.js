import express from "express";
import { aiSeoContentController } from "../controllers/AIController.js";

const router = express.Router();

router.post("/seo-generation", aiSeoContentController);

export default router;
