import shopify from "../shopify.js";
import {
  updatedTitleMeta,
  seofySitemap,
  productSitemap,
  pageSitemap,
  collectionsSitemap,
  blogSitemap,
  articleSitemap,
} from "../utils/snippets.js";
import { initializeThemeFileContent } from "../utils/initializeThemeContent.js";

export const createHomeSEOController = async (req, res, next) => {
  try {
    const { homeSeo } = req.body;

    // Update seo content to metafield
    const metafield = new shopify.api.rest.Metafield({
      session: res.locals.shopify.session,
    });

    metafield.namespace = "seo-app-bs23";
    metafield.key = "home-seo-value";
    metafield.value = JSON.stringify(homeSeo);
    metafield.type = "json";
    await metafield.save({
      update: true,
    });

    return res.status(200).json(metafield);
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};

export const getHomeSEOController = async (req, res, next) => {
  try {
    const response = await shopify.api.rest.Metafield.all({
      session: res.locals.shopify.session,
      namespace: "seo-app-bs23",
    });

    const highlight = response?.data?.find(
      (data) =>
        data?.namespace === "seo-app-bs23" && data?.key === "home-seo-value"
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

export const createSEOSnippetController = async (req, res, next) => {
  try {
    const session = res.locals.shopify.session;

    //for home seo create sitemap
    await initializeThemeFileContent({
      session,
      themeRole: "development",
      assetKey: "",
      snippetKey: "snippets/seofy-complete-seo-expert.liquid",
      snippetCode: updatedTitleMeta,
    });

    //For products sitemap
    await initializeThemeFileContent({
      session,
      themeRole: "development",
      assetKey: "",
      snippetKey: "templates/seofy-products-sitemap.liquid",
      snippetCode: productSitemap,
    });

    //For collections sitemap
    await initializeThemeFileContent({
      session,
      themeRole: "development",
      assetKey: "",
      snippetKey: "templates/seofy-collections-sitemap.liquid",
      snippetCode: collectionsSitemap,
    });

    //For blogs sitemap
    await initializeThemeFileContent({
      session,
      themeRole: "development",
      assetKey: "",
      snippetKey: "templates/seofy-blogs-sitemap.liquid",
      snippetCode: blogSitemap,
    });

    //For article sitemap
    await initializeThemeFileContent({
      session,
      themeRole: "development",
      assetKey: "",
      snippetKey: "templates/seofy-article-sitemap.liquid",
      snippetCode: articleSitemap,
    });

    //For page sitemap
    await initializeThemeFileContent({
      session,
      themeRole: "development",
      assetKey: "",
      snippetKey: "templates/seofy-page-sitemap.liquid",
      snippetCode: pageSitemap,
    });

    //For home sitemap
    await initializeThemeFileContent({
      session,
      themeRole: "development",
      assetKey: "",
      snippetKey: "templates/seofy-home-sitemap.liquid",
      snippetCode: seofySitemap,
    });

    //For home sitemap conditions
    await createHomeSnippets(res, "development");
    return res.status(200).json({
      status: "success",
      message: "successfully updated",
    });
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};

async function createHomeSnippets(res, role) {
  const themeList = await shopify.api.rest.Theme.all({
    session: res.locals.shopify.session,
    fields: "id,name,role",
  });

  const mainTheme = themeList?.data?.find((theme) => theme?.role === role);

  const assetFile = await shopify.api.rest.Asset.all({
    session: res.locals.shopify.session,
    theme_id: mainTheme?.id,
    asset: { key: "layout/theme.liquid" },
  });

  const assetFileContent = assetFile?.data?.[0]?.value;

  if (!assetFileContent.includes("{% render 'seofy-complete-seo-expert' %}")) {
    const updatedContent = assetFileContent.replace(
      "<head>",
      `<head>
      {% render 'seofy-complete-seo-expert' %}
      `
    );

    const layout = new shopify.api.rest.Asset({
      session: res.locals.shopify.session,
    });
    layout.theme_id = mainTheme?.id;
    layout.key = "layout/theme.liquid";
    layout.value = updatedContent;
    await layout.save({
      update: true,
    });
    return {
      message: "Created successfully",
    };
  }
  return {
    message: "Already created",
  };
}

async function isSeoSnippetsAvailable(session, id) {
  try {
    await shopify.api.rest.Asset.all({
      session: session,
      theme_id: id,
      asset: { key: "snippets/seofy-complete-seo-expert.liquid" },
    });
    return true;
  } catch (error) {
    return false;
  }
}
