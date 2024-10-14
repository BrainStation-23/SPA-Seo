import express from "express";
import { testApi } from "../controllers/Jsonld.js";

const router = express.Router();

router.get("/create-snippets", testApi);

export default router;
