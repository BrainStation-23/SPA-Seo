import express from "express";

import {
  createHtmlSitemapSeo,
  getHtmlSitemap,
} from "../controllers/htmlsitemap.js";

const router = express.Router();

router.get("/info", getHtmlSitemap);
router.post("/createorupdate", createHtmlSitemapSeo);

export default router;
