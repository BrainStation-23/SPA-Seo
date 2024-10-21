import express from "express";
import { imageCompression } from "../controllers/imageCompression.js";

const router = express.Router();

router.post("/:productId/:imageId", imageCompression);

export default router;
