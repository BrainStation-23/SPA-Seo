// File: SPA-Seo/web/routes/htmlCleanerRoutes.js

import express from "express";
import {
  getSettings,
  updateSettings,
  previewCleanup,
  applyCleanup,
  restoreBackup,
  // getCleanupReports // We can add this if a reports endpoint is needed later
} from "../controllers/htmlCleanerController.js"; //

const router = express.Router();

// --- Settings Routes ---
// GET /api/html-cleaner/settings - Retrieve cleanup settings
router.get("/settings", getSettings);

// POST /api/html-cleaner/settings - Update cleanup settings
router.post("/settings", updateSettings);

// --- Cleanup Action Routes ---
// POST /api/html-cleaner/preview - Preview HTML cleanup on provided content or a theme asset
router.post("/preview", previewCleanup);

// POST /api/html-cleaner/apply - Apply HTML cleanup to a theme asset (likely on MAIN theme)
router.post("/apply", applyCleanup);

// POST /api/html-cleaner/restore - Restore a theme asset from a backup
router.post("/restore", restoreBackup);

// --- Reporting Route (Placeholder - can be implemented later if needed) ---
// GET /api/html-cleaner/reports - Retrieve cleanup reports
// router.get("/reports", getCleanupReports);

export default router;
