import shopify from "../shopify.js";

const fetchAllBlogs = async (session) => {
  let allBlogs = [];
  let hasNextPage = true;
  let url = `/admin/api/2024-07/blogs.json`;
  let params = { limit: 200 };
  const client = new shopify.api.clients.Rest({ session });

  while (hasNextPage) {
    try {
      const response = await client.get({ path: url, query: params });
      allBlogs = allBlogs.concat(response?.body?.blogs);

      // Check if there is a next page
      const pageInfo = response?.pageInfo;
      if (pageInfo && pageInfo?.nextPageUrl) {
        params = pageInfo?.nextPage?.query;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      hasNextPage = false;
    }
  }

  return allBlogs;
};

export const getBlogList = async (req, res, next) => {
  try {
    const blogs = await fetchAllBlogs(res.locals.shopify.session);

    return res.status(200).json(blogs);
  } catch (err) {
    console.log("🚀 ~ file: description.js:73 ~ descriptionController ~ err:", err);
    res.status(400).json({ err });
  }
};

const fetchAllArticles = async (session, id) => {
  let allBlogs = [];
  let hasNextPage = true;
  let url = `/admin/api/2024-07/blogs/${id}/articles.json`;
  let params = { limit: 200 };
  const client = new shopify.api.clients.Rest({ session });

  while (hasNextPage) {
    try {
      const response = await client.get({ path: url, query: params });
      allBlogs = allBlogs.concat(response?.body?.articles);

      // Check if there is a next page
      const pageInfo = response?.pageInfo;
      if (pageInfo && pageInfo?.nextPageUrl) {
        params = pageInfo?.nextPage?.query;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      hasNextPage = false;
    }
  }

  return allBlogs;
};

export const getArticleList = async (req, res, next) => {
  try {
    const id = req.params.id;
    const articles = await fetchAllArticles(res.locals.shopify.session, id);

    return res.status(200).json(articles);
  } catch (err) {
    console.log("🚀 ~ file: description.js:73 ~ descriptionController ~ err:", err);
    res.status(400).json({ err });
  }
};

export const getArticleSeoContent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const response = await shopify.api.rest.Metafield.all({
      session: res.locals.shopify.session,
      namespace: "seo-app-bs23",
      article_id: id,
    });

    const highlight = response?.data?.find((data) => data?.key === "seo-blog-article");
    const highlightList = highlight?.value ? JSON.parse(highlight?.value) : "";

    return res.status(200).json(highlightList);
  } catch (err) {
    console.log("🚀 ~ file: description.js:73 ~ descriptionController ~ err:", err);
    res.status(400).json({ err });
  }
};

export const getSingleArticle = async (req, res) => {
  try {
    const { blogId, id } = req?.params;

    const article = await shopify.api.rest.Article.find({
      session: res.locals.shopify.session,
      blog_id: blogId,
      id: id,
      fields: "id, title,image,blogIid",
    });

    const response = await shopify.api.rest.Metafield.all({
      session: res.locals.shopify.session,
      namespace: "bs-23-seo-app",
      article_id: id,
    });
    const metafields = response?.data?.find((data) => data?.key === "json-ld");

    return res.status(200).json({ ...article, metafields });
  } catch (error) {
    console.log(error);
  }
};

export const getArticleById = async (session, blog_id, id) => {
  try {
    const article = await shopify.api.rest.Article.find({
      session,
      blog_id,
      id,
    });
    return article;
  } catch (error) {
    console.log(error);
  }
};
export const updateArticleSeo = async (req, res) => {
  const { seoObj } = req.body;

  try {
    const metafield = new shopify.api.rest.Metafield({
      session: res.locals.shopify.session,
    });
    metafield.article_id = seoObj?.id;
    metafield.namespace = "seo-app-bs23";
    metafield.key = "seo-blog-article";
    metafield.type = "json";
    metafield.value = JSON.stringify(seoObj);
    await metafield.save({
      update: true,
    });
    const blog_id = seoObj?.blog_id;
    const article_id = seoObj?.id;
    const article = await getArticleById(res.locals.shopify.session, blog_id, article_id);
    return res.status(200).json({ metafield, article });
  } catch (error) {
    console.log(error);
  }
};

export const updateImageSeoAltController = async (req, res, next) => {
  try {
    const { id, blogId, image } = req.body;

    const article = new shopify.api.rest.Article({
      session: res.locals.shopify.session,
    });
    article.blog_id = blogId;
    article.id = id;
    article.image = image;

    await article.save({
      update: true,
    });
    const articleData = await shopify.api.rest.Article.find({
      session: res.locals.shopify.session,
      blog_id: blogId,
      id: id,
    });
    return res.status(200).json({ status: "Success", message: "Successfully updated", articleData });
  } catch (err) {
    console.log("🚀 ~ file: description.js:73 ~ descriptionController ~ err:", err);
    res.status(400).json({ err });
  }
};
