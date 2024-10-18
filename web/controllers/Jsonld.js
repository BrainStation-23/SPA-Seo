import shopify from "../shopify.js";
import { initializeThemeFileContent } from "../utils/initializeThemeContent.js";
import { code } from "../utils/jsonld-snippet-code.js";

export const testApi = async (req, res, next) => {
  try {
    await updateThemeFiles(res.locals.shopify.session);
    return res.status(200).json({ message: "GG" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};

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
                    themes(first: 1, roles: DEVELOPMENT) {
                      edges {
                        node {
                          id
                          files(
                            first: 4
                            filenames: ["sections/main-product.liquid", "sections/main-article.liquid", "sections/header.liquid", "sections/main-collection-product-grid.liquid", "snippets/seofy-jsonld.liquid"]
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

    const updatedProductBody = updateProductThemeBody(
      themeFilesMap.get("sections/main-product.liquid").body
    );
    const variables = {
      themeId: themeId,
      files: [
        {
          filename: "sections/main-product.liquid",
          body: {
            type: "TEXT",
            value: updateProductThemeBody(
              themeFilesMap.get("sections/main-product.liquid").body
            ),
          },
        },
        {
          filename: "sections/main-article.liquid",
          body: {
            type: "TEXT",
            value: updateArticleThemeBody(
              themeFilesMap.get("sections/main-article.liquid").body
            ),
          },
        },
        {
          filename: "sections/main-collection-product-grid.liquid",
          body: {
            type: "TEXT",
            value: updateCollectionThemeBody(
              themeFilesMap.get("sections/main-collection-product-grid.liquid")
                .body
            ),
          },
        },
        {
          filename: "sections/header.liquid",
          body: {
            type: "TEXT",
            value: updateCompanyThemeBody(
              themeFilesMap.get("sections/header.liquid").body
            ),
          },
        },
      ],
    };

    if (!themeFilesMap.has("snippets/seofy-jsonld.liquid"))
      variables.files.push({
        filename: "snippets/seofy-jsonld.liquid",
        body: {
          type: "TEXT",
          value: code,
        },
      });

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
  } catch (error) {
    console.error(error);
  }
}

function updateProductThemeBody(body) {
  const productSnippetRegExp =
    /<script\s+type="application\/ld\+json">\s*{{\s*product\s*\|\s*structured_data\s*}}\s*<\/script>/g;
  let updatedContent = body;

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
    } else {
      updatedContent =
        `
        {% assign data = product.metafields['bs-23-seo-app']['json-ld'].value %}
        {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
        {% if data != null and data.active %}
          {% render 'seofy-jsonld', render_type:"product", data: data.product, org_data: shop_data.organization %}
        {% endif %}
        ` + body;
    }
  }

  return updatedContent;
}

function updateArticleThemeBody(assetFileContent) {
  const articleSnippetRegExp =
    /<script\s+type="application\/ld\+json">\s*{{\s*article\s*\|\s*structured_data\s*}}\s*<\/script>/g;
  let updatedContent = assetFileContent;

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
    } else {
      updatedContent =
        `
          {% assign data = article.metafields['bs-23-seo-app']['json-ld'].value %}
          {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
          {% if data != null and data.active %}
            {% render 'seofy-jsonld', render_type:"article", data: data.article, org_data: shop_data.organization %}
          {% endif %}
          ` + assetFileContent;
    }
  }

  return updatedContent;
}

function updateCollectionThemeBody(assetFileContent) {
  const collectionSnippetRegExp =
    /<script\s+type="application\/ld\+json">\s*{{\s*collection\s*\|\s*structured_data\s*}}\s*<\/script>/g;
  let updatedContent = assetFileContent;

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
    } else {
      updatedContent =
        `
      {% assign data = collection.metafields['bs-23-seo-app']['json-ld'].value %}
      {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
      {% if data != null and data.active %}
        {% render 'seofy-jsonld', render_type:"collection", data: data.collection, org_data: shop_data.organization %}
      {% endif %}
      ` + assetFileContent;
    }
  }

  return updatedContent;
}

function updateCompanyThemeBody(assetFileContent) {
  const companySnippetRegExp =
    /<script\s+type="application\/ld\+json">\s*[^]*?"@type"\s*:\s*"Organization"[^]*?<\/script>/g;
  let updatedContent = assetFileContent;

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
    } else {
      updatedContent =
        `
      {% assign shop_data = shop.metafields['bs-23-seo-app']['json-ld'].value %}
      {% if shop_data != null and shop_data.organization.status %}
        {% render 'seofy-jsonld', render_type:"company", data: shop_data.organization %}
      {% endif %}
      ` + assetFileContent;
    }
  }

  return updatedContent;
}
