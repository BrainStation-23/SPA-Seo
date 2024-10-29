import shopify from "../shopify.js";
import { templates } from "../utils/templates.js";

export const uninstallCleanup = async (req, res) => {
  try {
    console.log("uninstall");
    const client = new shopify.api.clients.Graphql({
      apiVersion: "2024-10",
      session: res.locals.shopify.session,
    });

    let initialData = await client.query({
      data: {
        query: `
              query GetShopMetafield {
                shop {
                  metafield(key: "json-ld-saved-history", namespace: "bs-23-seo-app") {
                    id
                    namespace
                    key
                    value
                  }
                }
                shop_defs: metafieldDefinitions(
                  first: 250
                  ownerType: SHOP
                  namespace: "bs-23-seo-app"
                ) {
                  edges {
                    node {
                      id
                      key
                      namespace
                    }
                  }
                }
                product_defs: metafieldDefinitions(
                  first: 250
                  ownerType: PRODUCT
                  namespace: "bs-23-seo-app"
                ) {
                  edges {
                    node {
                      id
                      key
                      namespace
                    }
                  }
                }
                article_defs: metafieldDefinitions(
                  first: 250
                  ownerType: ARTICLE
                  namespace: "bs-23-seo-app"
                ) {
                  edges {
                    node {
                      id
                      key
                      namespace
                    }
                  }
                }
                collection_defs: metafieldDefinitions(
                  first: 250
                  ownerType: COLLECTION
                  namespace: "bs-23-seo-app"
                ) {
                  edges {
                    node {
                      id
                      key
                      namespace
                    }
                  }
                }
              }
            `,
      },
    });
    const data = initialData.body.data;
    const previousThemeCodes = JSON.parse(
      initialData.body.data.shop.metafield.value
    );

    const metafieldDefinitionIds = [];
    const deleteQuery = (id, index, owner) => `
        ${owner}_${index}: metafieldDefinitionDelete(
          id: "${id}"
          deleteAllAssociatedMetafields: true
        ) {
          deletedDefinitionId
          userErrors {
            field
            message
            code
          }
        }`;

    data.shop_defs.edges.forEach(({ node }, index) => {
      metafieldDefinitionIds.push(deleteQuery(node.id, index, "shop"));
    });
    data.product_defs.edges.forEach(({ node }, index) => {
      metafieldDefinitionIds.push(deleteQuery(node.id, index, "product"));
    });
    data.article_defs.edges.forEach(({ node }, index) => {
      metafieldDefinitionIds.push(deleteQuery(node.id, index, "article"));
    });
    data.collection_defs.edges.forEach(({ node }, index) => {
      metafieldDefinitionIds.push(deleteQuery(node.id, index, "collection"));
    });

    const deleteAllMetafieldsQuery = metafieldDefinitionIds.join("");

    const themeFilesMap = new Map();
    let themeQueryResponse = await client.query({
      data: {
        query: `
                      query GetDevTheme {
                        themes(first: 1, roles: MAIN) {
                          edges {
                            node {
                              id
                              files(
                                first: 6
                                filenames: [ "layout/theme.liquid", "sections/main-product.liquid", "sections/main-article.liquid", "sections/header.liquid", "sections/main-collection-product-grid.liquid", "${templates.seoJsonld}"]
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
    const themeId = themeQueryResponse.body.data.themes.edges[0].node.id;
    themeQueryResponse.body.data.themes.edges[0].node.files.edges.forEach(
      ({ node }) => {
        themeFilesMap.set(node.filename, node.body.content);
      }
    );

    // Revert the theme changes
    const filesToBeReverted = [
      {
        filename: "layout/theme.liquid",
        body: {
          type: "TEXT",
          value: themeFilesMap
            .get("layout/theme.liquid")
            .replace("{% render 'seofy-complete-seo-expert' %}", ""),
        },
      },
      {
        filename: "sections/main-product.liquid",
        body: {
          type: "TEXT",
          value: themeFilesMap
            .get("sections/main-product.liquid")
            .replace(
              previousThemeCodes["sections/main-product.liquid"].updated_code,
              previousThemeCodes["sections/main-product.liquid"].prev_code
            ),
        },
      },
      {
        filename: "sections/main-article.liquid",
        body: {
          type: "TEXT",
          value: themeFilesMap
            .get("sections/main-article.liquid")
            .replace(
              previousThemeCodes["sections/main-article.liquid"].updated_code,
              previousThemeCodes["sections/main-article.liquid"].prev_code
            ),
        },
      },
      {
        filename: "sections/main-collection-product-grid.liquid",
        body: {
          type: "TEXT",
          value: themeFilesMap
            .get("sections/main-collection-product-grid.liquid")
            .replace(
              previousThemeCodes["sections/main-collection-product-grid.liquid"]
                .updated_code,
              previousThemeCodes["sections/main-collection-product-grid.liquid"]
                .prev_code
            ),
        },
      },
      {
        filename: "sections/header.liquid",
        body: {
          type: "TEXT",
          value: themeFilesMap
            .get("sections/header.liquid")
            .replace(
              previousThemeCodes["sections/header.liquid"].updated_code,
              previousThemeCodes["sections/header.liquid"].prev_code
            ),
        },
      },
    ];

    // Delete snippet files
    const filesToBeDeleted = Object.entries(templates).map(
      ([key, value]) => value
    );

    function wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    await client.query({
      data: {
        query: `mutation ThemeCleanupMutation {
                      ${deleteAllMetafieldsQuery}
                    }`,
      },
    });

    console.log("all metafields deleted");

    await wait(2000);
    const cleanupResponse = await client.query({
      data: {
        variables: {
          themeId: themeId,
          filesToBeReverted: filesToBeReverted,
        },
        query: `mutation CleanupMutation($themeId: ID!, $filesToBeReverted: [OnlineStoreThemeFilesUpsertFileInput!]!) {
                        themeFilesUpsert(files: $filesToBeReverted, themeId: $themeId) {
                          job {
                            id
                            done
                          }
                          upsertedThemeFiles {
                            filename
                          }
                          userErrors {
                            field
                            message
                          }
                        }
                      }`,
      },
    });

    console.log("theme code reverted");

    await wait(5000);
    const themeFilesDelete = await client.query({
      data: {
        variables: {
          themeId: themeId,
          filesToBeDeleted: filesToBeDeleted,
        },
        query: `mutation ThemeFilesDeleteMutation($themeId: ID!, $filesToBeDeleted: [String!]!) {
                      themeFilesDelete(files: $filesToBeDeleted, themeId: $themeId) {
                          deletedThemeFiles {
                            filename
                          }
                          userErrors {
                            field
                            message
                          }
                        }
                      }`,
      },
    });

    console.log("theme files deleted");

    return res.status(200).send("uninstall");
  } catch (error) {
    // console.log("error in uninstall");
    // console.log(error);
    return res.status(200).send("uninstall");
  }
};
