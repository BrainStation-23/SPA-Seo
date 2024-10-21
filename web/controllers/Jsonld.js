import shopify from "../shopify.js";
import { seofyJsonldSnippet } from "../utils/snippets.js";
import { templates } from "../utils/templates.js";
import {
  CheckShopMetafieldDefinition,
  CreateShopMetafieldDefinition,
  GetShopId,
  GetShopMetafield,
  SetShopMetafield,
} from "../graphql/metafields.js";

export const InitializeJsonldApi = async (req, res, next) => {
  try {
    const payloadToBeSaved = await updateThemeFiles(res.locals.shopify.session);
    await savePreviousThemeCodesToMetafield({
      session: res.locals.shopify.session,
      payload: payloadToBeSaved,
    });
    return res.status(200).json({ message: "GG" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};

async function initializeMetafield(session) {
  try {
    const metafieldData = null;
    const client = new shopify.api.clients.Graphql({ session });
    const checkMetafieldResponse = await client.query({
      data: {
        query: CheckShopMetafieldDefinition(
          "SHOP",
          "bs-23-seo-app",
          "json-ld-saved-history"
        ),
      },
    });

    if (
      checkMetafieldResponse.body.data.metafieldDefinitions.edges.length == 0
    ) {
      const metafieldCreationResponse = await client.query({
        data: {
          query: CreateShopMetafieldDefinition(
            "SHOP",
            "bs-23-seo-app",
            "json-ld-saved-history",
            "Metafield to save code snippets of the original theme file before adding json-ld snippets"
          ),
        },
      });

      if (
        metafieldCreationResponse.body.data.metafieldDefinitionCreate.userErrors
          .length > 0
      ) {
        throw new Error({
          status: 400,
          error:
            metafieldCreationResponse.body.data.metafieldDefinitionCreate
              .userErrors,
        });
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function savePreviousThemeCodesToMetafield({ session, payload }) {
  try {
    await initializeMetafield(session);
    console.log("saving previous theme codes to metafield");
    console.log(payload);

    const client = new shopify.api.clients.Graphql({ session });
    const shopMetafieldQuery = await client.query({
      data: {
        query: GetShopMetafield({
          namespace: "bs-23-seo-app",
          key: "json-ld-saved-history",
        }),
      },
    });

    payload.forEach(async (file) => {
      if (file.prev_code.length > 0) {
      }
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function updateThemeFiles(session) {
  try {
    const client = new shopify.api.clients.Graphql({
      apiVersion: "2024-10",
      session,
    });

    const themeQueryResponse = await client.query({
      data: {
        query: `
                  query GetDevTheme {
                    themes(first: 1, roles: MAIN) {
                      edges {
                        node {
                          id
                          files(
                            first: 5
                            filenames: ["sections/main-product.liquid", "sections/main-article.liquid", "sections/header.liquid", "sections/main-collection-product-grid.liquid", "${templates.seoJsonld}"]
                          ) {
                            edges {
                              node {
                                filename
                                size
                                body {
                                  ... on OnlineStoreThemeFileBodyText {
                                    content
                                  }
                                }
                                checksumMd5
                                contentType
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                `,
      },
    });

    console.log("got theme files");

    const themeId = themeQueryResponse.body.data.themes.edges[0].node.id;
    const themeFilesMap = new Map();

    themeQueryResponse.body.data.themes.edges[0].node.files.edges.forEach(
      ({ node }) => {
        themeFilesMap.set(node.filename, {
          filename: node.filename,
          body: node.body.content,
        });
      }
    );

    const { hitory: product_history, updatedContent: updated_product_content } =
      updateProductThemeBody(
        themeFilesMap.get("sections/main-product.liquid").body
      );
    const { history: article_history, updatedContent: updated_article_conent } =
      updateArticleThemeBody(
        themeFilesMap.get("sections/main-article.liquid").body
      );
    const {
      history: collection_history,
      updatedContent: updated_collection_content,
    } = updateCollectionThemeBody(
      themeFilesMap.get("sections/main-collection-product-grid.liquid").body
    );
    const {
      history: company_history,
      updatedContent: updated_company_content,
    } = updateCompanyThemeBody(
      themeFilesMap.get("sections/header.liquid").body
    );

    const variables = {
      themeId: themeId,
      files: [
        {
          filename: "sections/main-product.liquid",
          body: {
            type: "TEXT",
            value: updated_product_content,
          },
        },
        {
          filename: "sections/main-article.liquid",
          body: {
            type: "TEXT",
            value: updated_article_conent,
          },
        },
        {
          filename: "sections/main-collection-product-grid.liquid",
          body: {
            type: "TEXT",
            value: updated_collection_content,
          },
        },
        {
          filename: "sections/header.liquid",
          body: {
            type: "TEXT",
            value: updated_company_content,
          },
        },
      ],
    };

    if (!themeFilesMap.has(templates.seoJsonld)) {
      variables.files.push({
        filename: templates.seoJsonld,
        body: {
          type: "TEXT",
          value: seofyJsonldSnippet,
        },
      });
      console.log("added seo jsonld snippet");
    }

    const response = await client.query({
      data: {
        variables,
        query: `
          mutation EditThemeFiles($files: [OnlineStoreThemeFilesUpsertFileInput!]!, $themeId: ID!) {
            themeFilesUpsert(files: $files, themeId: $themeId) {
              job {
                # Job fields
                id
                done
              }
              upsertedThemeFiles {
                # OnlineStoreThemeFileOperationResult fields
                filename
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
      },
    });

    console.log("updated theme files");

    if (response.body.data.themeFilesUpsert.userErrors.length > 0) {
      throw response.body.data.themeFilesUpsert.userErrors;
    }

    return [
      { filename: "sections/main-product.liquid", ...product_history },
      { filename: "sections/main-article.liquid", ...article_history },
      {
        filename: "sections/main-collection-product-grid.liquid",
        ...collection_history,
      },
      {
        filename: "sections/header.liquid",
        ...company_history,
      },
    ];
  } catch (error) {
    console.error(error);
  }
}

function updateProductThemeBody(body) {
  const productSnippetRegExp =
    /<script\s+type="application\/ld\+json">\s*{{\s*product\s*\|\s*structured_data\s*}}\s*<\/script>/g;
  let updatedContent = body;
  let hitory = { prev_code: "", updated_code: "" };

  if (
    !body.includes(
      `{% render 'seofy-jsonld', render_type:"product", data: data.product, org_data: shop_data.organization %}`
    )
  ) {
    if (productSnippetRegExp.test(body)) {
      const prev_code = body.match(productSnippetRegExp)[0];
      updatedContent = updatedContent.replace(
        productSnippetRegExp,
        `
        {% assign data = product.metafields['bs-23-seo-app']['json-ld'].value %}
        {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
        {% if data != null and data.active %}
          {% render 'seofy-jsonld', render_type:"product", data: data.product, org_data: shop_data.organization %}
        {% else %}
        ${prev_code}
        {% endif %}  
        `
      );
      hitory.prev_code = prev_code;
      hitory.updated_code = `
        {% assign data = product.metafields['bs-23-seo-app']['json-ld'].value %}
        {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
        {% if data != null and data.active %}
          {% render 'seofy-jsonld', render_type:"product", data: data.product, org_data: shop_data.organization %}
        {% else %}
        ${prev_code}
        {% endif %}  
        `;
    } else {
      updatedContent =
        `
        {% assign data = product.metafields['bs-23-seo-app']['json-ld'].value %}
        {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
        {% if data != null and data.active %}
          {% render 'seofy-jsonld', render_type:"product", data: data.product, org_data: shop_data.organization %}
        {% endif %}
        ` + body;

      hitory.prev_code = "";
      hitory.updatedContent = `
        {% assign data = product.metafields['bs-23-seo-app']['json-ld'].value %}
        {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
        {% if data != null and data.active %}
          {% render 'seofy-jsonld', render_type:"product", data: data.product, org_data: shop_data.organization %}
        {% endif %}
        `;
    }
  }

  return { updatedContent, hitory };
}

function updateArticleThemeBody(assetFileContent) {
  const articleSnippetRegExp =
    /<script\s+type="application\/ld\+json">\s*{{\s*article\s*\|\s*structured_data\s*}}\s*<\/script>/g;
  let updatedContent = assetFileContent;
  let history = { prev_code: "", updated_code: "" };

  if (
    !assetFileContent.includes(
      `{% render 'seofy-jsonld', render_type:"article", data: data.article, org_data: shop_data.organization %}`
    )
  ) {
    if (articleSnippetRegExp.test(assetFileContent)) {
      const prev_code = assetFileContent.match(articleSnippetRegExp)[0];
      updatedContent = updatedContent.replace(
        articleSnippetRegExp,
        `
          {% assign data = article.metafields['bs-23-seo-app']['json-ld'].value %}
          {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
          {% if data != null and data.active %}
            {% render 'seofy-jsonld', render_type:"article", data: data.article, org_data: shop_data.organization %}
          {% else %}
            ${prev_code}
          {% endif %}  
          `
      );
      history.prev_code = prev_code;
      history.updated_code = `
      {% assign data = article.metafields['bs-23-seo-app']['json-ld'].value %}
      {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
      {% if data != null and data.active %}
        {% render 'seofy-jsonld', render_type:"article", data: data.article, org_data: shop_data.organization %}
      {% else %}
        ${prev_code}
      {% endif %}  
      `;
    } else {
      updatedContent =
        `
          {% assign data = article.metafields['bs-23-seo-app']['json-ld'].value %}
          {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
          {% if data != null and data.active %}
            {% render 'seofy-jsonld', render_type:"article", data: data.article, org_data: shop_data.organization %}
          {% endif %}
          ` + assetFileContent;
      history.prev_code = "";
      history.updated_code = `
          {% assign data = article.metafields['bs-23-seo-app']['json-ld'].value %}
          {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
          {% if data != null and data.active %}
            {% render 'seofy-jsonld', render_type:"article", data: data.article, org_data: shop_data.organization %}
          {% endif %}
          `;
    }
  }

  return { updatedContent, history };
}

function updateCollectionThemeBody(assetFileContent) {
  const collectionSnippetRegExp =
    /<script\s+type="application\/ld\+json">\s*{{\s*collection\s*\|\s*structured_data\s*}}\s*<\/script>/g;
  let updatedContent = assetFileContent;
  let history = { prev_code: "", updated_code: "" };

  if (
    !assetFileContent.includes(
      `{% render 'seofy-jsonld', render_type:"collection", data: data.collection, org_data: shop_data.organization %}`
    )
  ) {
    if (collectionSnippetRegExp.test(assetFileContent)) {
      const prev_code = assetFileContent.match(collectionSnippetRegExp)[0];
      updatedContent = updatedContent.replace(
        collectionSnippetRegExp,
        `
      {% assign data = collection.metafields['bs-23-seo-app']['json-ld'].value %}
      {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
      {% if data != null and data.active %}
        {% render 'seofy-jsonld', render_type:"collection", data: data.collection, org_data: shop_data.organization %}
      {% else %}
        ${prev_code}
      {% endif %}  
      `
      );
      history.prev_code = prev_code;
      history.updated_code = `
      {% assign data = collection.metafields['bs-23-seo-app']['json-ld'].value %}
      {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
      {% if data != null and data.active %}
        {% render 'seofy-jsonld', render_type:"collection", data: data.collection, org_data: shop_data.organization %}
      {% else %}
        ${prev_code}
      {% endif %}  
      `;
    } else {
      updatedContent =
        `
      {% assign data = collection.metafields['bs-23-seo-app']['json-ld'].value %}
      {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
      {% if data != null and data.active %}
        {% render 'seofy-jsonld', render_type:"collection", data: data.collection, org_data: shop_data.organization %}
      {% endif %}
      ` + assetFileContent;
      history.prev_code = "";
      history.updated_code = `
      {% assign data = collection.metafields['bs-23-seo-app']['json-ld'].value %}
      {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
      {% if data != null and data.active %}
        {% render 'seofy-jsonld', render_type:"collection", data: data.collection, org_data: shop_data.organization %}
      {% endif %}
      `;
    }
  }

  return { updatedContent, history };
}

function updateCompanyThemeBody(assetFileContent) {
  const companySnippetRegExp =
    /<script\s+type="application\/ld\+json">\s*[^]*?"@type"\s*:\s*"Organization"[^]*?<\/script>/g;
  let updatedContent = assetFileContent;
  let history = { prev_code: "", updated_code: "" };

  if (
    !assetFileContent.includes(
      `{% render 'seofy-jsonld', render_type:"company", data: shop_data.organization %}`
    )
  ) {
    if (companySnippetRegExp.test(assetFileContent)) {
      const prev_code = assetFileContent.match(companySnippetRegExp)[0];
      updatedContent = updatedContent.replace(
        companySnippetRegExp,
        `
      {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
      {% if shop_data != null and shop_data.organization.status %}
        {% render 'seofy-jsonld', render_type:"company", data: shop_data.organization %}
      {% else %}
        ${prev_code}
      {% endif %}  
      `
      );
      history.prev_code = prev_code;
      history.updated_code = `
      {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
      {% if shop_data != null and shop_data.organization.status %}
        {% render 'seofy-jsonld', render_type:"company", data: shop_data.organization %}
      {% else %}
        ${prev_code}
      {% endif %}  
      `;
    } else {
      updatedContent =
        `
      {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
      {% if shop_data != null and shop_data.organization.status %}
        {% render 'seofy-jsonld', render_type:"company", data: shop_data.organization %}
      {% endif %}
      ` + assetFileContent;
      history.prev_code = "";
      history.updated_code = `
      {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
      {% if shop_data != null and shop_data.organization.status %}
        {% render 'seofy-jsonld', render_type:"company", data: shop_data.organization %}
      {% endif %}
      `;
    }
  }

  return { updatedContent, history };
}
