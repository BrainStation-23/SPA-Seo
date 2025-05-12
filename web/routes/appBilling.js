import express from "express";
import {
  createAppSubscription,
  cancelAppSubscription,
  getActiveSubscription,
} from "../controllers/appBilling.js";

const router = express.Router();

router.get("/get-store-info", getActiveSubscription);
router.post("/app-billing-create", createAppSubscription);
router.post("/app-billing-cancel", cancelAppSubscription);

export default router;
