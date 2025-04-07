import express from "express";
import {
  getArticleList,
  updateArticleSeo,
  getBlogList,
  getArticleSeoContent,
  getSingleArticle,
  updateImageSeoAltController,
  uploadFile,
} from "../controllers/blog.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get("/list", getBlogList);
router.get("/articles/:id", getArticleList);
router.get("/article-seo/:id", getArticleSeoContent);
router.get("/articleById/:blogId/:id", getSingleArticle);
router.post("/update-article-seo", updateArticleSeo);
router.post("/update-article-image-alt", updateImageSeoAltController);
router.post("/upload-blog-file", upload.single("file"), uploadFile);

export default router;
