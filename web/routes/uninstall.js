import express from "express";
import { uninstallCleanup } from "../controllers/uninstall.js";

const router = express.Router();

router.get("/", uninstallCleanup);

export default router;
