import express from "express";
import {
  imageCompression,
  handleImageCompressionRequest,
} from "../controllers/imageCompression.js";

const router = express.Router();

router.post("/:productId/:imageId", imageCompression);
router.post("/optimize", handleImageCompressionRequest);

export default router;
