import express from "express";
import { filesController } from "../controllers/files.js";

const router = express.Router();

router.get("/list", filesController);

export default router;
