import express from "express";
import { applyStreamlineCodeToLiveTheme } from "../controllers/htmlCleanerController.js"; //

const router = express.Router();

// --- Cleanup Action Routes ---

// POST /api/html-cleaner/apply-all-streamline
// Applies HTML cleanup ("Streamline Code") to all relevant Liquid files in the MAIN theme.
// Uses the static configuration within htmlCleanerService.
// This is the endpoint your "Speed up Now" button (with "Streamline Code" enabled) should hit.
router.post("/apply-all-streamline", applyStreamlineCodeToLiveTheme);

export default router;
