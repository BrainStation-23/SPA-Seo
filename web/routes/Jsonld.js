import express from "express";
import { InitializeJsonldApi } from "../controllers/Jsonld.js";

const router = express.Router();

router.get("/create-snippets", InitializeJsonldApi);

export default router;
