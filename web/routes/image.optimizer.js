import express from "express";
import { BulkUpdateAltText } from "../controllers/image.optimizer.js";

const router = express.Router();

router.get("/alt-text", BulkUpdateAltText);

export default router;
