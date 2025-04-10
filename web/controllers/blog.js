import {
  createArticle,
  fileCreateQuery,
  uploadFileQuery,
} from "../graphql/article.js";
import shopify from "../shopify.js";
import axios from "axios";
import FormData from "form-data";

const blogQuery = (variables) => {
  let query = `query ($count: Int!, $cursor: String) {
    blogs(first: $count, after: $cursor, reverse: true) {
      nodes {
        id
        handle
        title
        updatedAt
        commentPolicy
        feed {
          path
          location
        }
        createdAt
        templateSuffix
        tags
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }`;
  if (variables?.before) {
    query = query.replace("first:", "last:");
    query = query.replace("after:", "before:");
  }
  return query;
};

const fetchAllBlogs = async (session, variables) => {
  const query = blogQuery(variables);

  const client = new shopify.api.clients.Graphql({
    session: session,
    apiVersion: "2024-10",
  });

  const response = await client.query({
    data: {
      query: query,
      variables: variables,
    },
  });

  const pageInfo = response.body.data?.blogs?.pageInfo;
  const blogs = response.body.data?.blogs?.nodes;

  return { blogs, pageInfo };
};

export const getBlogList = async (req, res, next) => {
  try {
    const afterCursor = req?.query?.afterCursor;
    const beforeCursor = req?.query?.beforeCursor;
    const limit = req?.query?.limit;

    let variables = {
      count: +limit,
      cursor: afterCursor || beforeCursor || null,
      after: afterCursor || null,
      before: beforeCursor || null,
    };

    const blogs = await fetchAllBlogs(res.locals.shopify.session, variables);

    return res.status(200).json(blogs);
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
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
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};

export const createArticleContent = async (req, res, next) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
      apiVersion: "2024-10",
    });

    const shop = await shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
    });

    // Step 1: Request to Shopify GraphQL to get the staging URL
    const variables = {
      article: {
        ...req.body,
        author: {
          name: shop.data[0]?.name,
        },
      },
    };

    // console.log("🚀 ~ createArticleContent ~ shop:", req);
    const response = await client.query({
      data: {
        query: createArticle(), // Query to request the staging URL
        variables: variables,
      },
    });
    const article = response?.body?.data?.articleCreate?.article;

    const userErrors = response?.body?.data?.articleCreate?.userErrors;
    if (userErrors?.length > 0) {
      return res.status(400).json({
        status: "Error",
        message: userErrors[0]?.message,
      });
    }
    return res.status(200).json({
      status: "Success",
      message: "Successfully created",
      article,
    });
  } catch (error) {
    console.log(error?.response?.errors, "error");
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

    const highlight = response?.data?.find(
      (data) => data?.key === "seo-blog-article"
    );
    const highlightList = highlight?.value ? JSON.parse(highlight?.value) : "";

    return res.status(200).json(highlightList);
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
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
    const article = await getArticleById(
      res.locals.shopify.session,
      blog_id,
      article_id
    );
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
    return res.status(200).json({
      status: "Success",
      message: "Successfully updated",
      articleData,
    });
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};

export async function uploadFile(req, res) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = generateUniqueFileName(file.originalname);
    const fileMime = file.mimetype || "application/octet-stream";

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
      apiVersion: "2024-07",
    });

    // Step 1: Request to Shopify GraphQL to get the staging URL
    const variables = {
      input: [
        {
          resource: "FILE",
          filename: fileName,
          httpMethod: "POST",
          mimeType: fileMime,
        },
      ],
    };

    const response = await client.query({
      data: {
        query: uploadFileQuery(), // Query to request the staging URL
        variables: variables,
      },
    });

    const stagedUpload =
      response?.body?.data?.stagedUploadsCreate?.stagedTargets?.[0];

    if (!stagedUpload) {
      throw new Error("No staging URL returned by Shopify");
    }
    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
      throw new Error("Invalid file buffer");
    }
    const form = new FormData();

    // Add staged upload parameters from Shopify
    stagedUpload.parameters.forEach((p) => form.append(p.name, p.value));

    // Append the actual file buffer
    form.append("file", file.buffer, {
      filename: fileName,
      contentType: fileMime,
    });

    // Use axios to send the POST request
    const fetchResponse = await axios.post(stagedUpload.url, form, {
      headers: {
        ...form.getHeaders(), // Important to include the multipart boundary
      },
      maxBodyLength: Infinity, // Important for large files
      maxContentLength: Infinity,
    });

    // Step 4: Once uploaded, create the file entry in Shopify
    const fileCreateVariables = {
      files: {
        alt: file.originalname, // You can modify alt text or make it dynamic
        contentType: "IMAGE",
        originalSource: stagedUpload?.resourceUrl,
      },
    };

    const fileCreate = await client.query({
      data: {
        query: fileCreateQuery(), // Query to create a file entry in Shopify
        variables: fileCreateVariables,
      },
    });
    console.log("🚀 ~ uploadFile ~ fileCreate:");

    // Return the file info as a response
    res.status(200).json({ imageUrl: stagedUpload.resourceUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "File upload failed" });
  }
}

function generateUniqueFileName(originalName) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split(".").pop();
  return `${timestamp}-${randomStr}.${ext}`;
}
