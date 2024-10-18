import shopify from "../shopify.js";

export const getHtmlSitemap = async (req, res, next) => {
  try {
    const response = await shopify.api.rest.Metafield.all({
      session: res.locals.shopify.session,
      namespace: "seo-app-bs23",
    });

    const highlight = response?.data?.find(
      (data) => data?.key === "seo-htmlsitemap-article"
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

export const createHtmlSitemapSeo = async (req, res) => {
  try {
    const blogs = await shopify.api.rest.Blog.all({
      session: res.locals.shopify.session,
    });

    const blogHandle = blogs?.data?.map((data) => data?.handle);

    let sitemapData = {
      ...req.body,
      seofy_blogs: blogHandle,
    };
    const metafield = new shopify.api.rest.Metafield({
      session: res.locals.shopify.session,
    });

    metafield.namespace = "seo-app-bs23";
    metafield.key = "seo-htmlsitemap-article";

    metafield.type = "json";
    metafield.value = JSON.stringify(sitemapData);
    await metafield.save({
      update: true,
    });
    return res.status(200).json(metafield);
  } catch (error) {
    console.log(error);
  }
};

export const autoRedirectListController = async (req, res, next) => {
  try {
    const redirectList = await shopify.api.rest.Redirect.all({
      session: res.locals.shopify.session,
      limit: 250,
    });

    return res
      .status(200)
      .json({ status: "Success", redirectList: redirectList?.data });
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};

export const createAutoRedirectController = async (req, res, next) => {
  try {
    const { path, target } = req.body;

    const redirect = new shopify.api.rest.Redirect({
      session: res.locals.shopify.session,
    });
    redirect.path = path;
    redirect.target = target;
    await redirect.save({
      update: true,
    });

    return res
      .status(200)
      .json({ status: "Success", message: "Successfully updated" });
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};

export const editAutoRedirectController = async (req, res, next) => {
  try {
    const { path, target } = req.body;

    const redirect = new shopify.api.rest.Redirect({
      session: res.locals.shopify.session,
    });

    redirect.id = req.params.id;
    redirect.path = path;
    redirect.target = target;
    await redirect.save({
      update: true,
    });

    return res
      .status(200)
      .json({ status: "Success", message: "Successfully updated" });
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};
