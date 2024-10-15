import express from "express";
import {
  MetafieldCreate,
  GetMetafields,
  SaveImageOptimizerSettings,
  GetImageOptimizerSettings,
} from "../controllers/metafields.js";

const router = express.Router();

router.post("/create", MetafieldCreate);
router.get("/get/image-optimizer", GetImageOptimizerSettings);
router.post("/save/image-optimizer", SaveImageOptimizerSettings);
router.get("/", GetMetafields);

export default router;
