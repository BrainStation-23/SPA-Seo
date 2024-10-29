import express from "express";
import {
  BulkUpdateAltText,
  updateProductImageFilename,
  bulkUpdateProductImageFilename,
} from "../controllers/image.optimizer.js";

const router = express.Router();

router.get("/alt-text", BulkUpdateAltText);
router.post("/filename", updateProductImageFilename);
router.post("/filename/all", bulkUpdateProductImageFilename);

export default router;
