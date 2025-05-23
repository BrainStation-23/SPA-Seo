import shopify from "../shopify.js";
import { extname, basename } from "path";
import { getProductByID } from "./products.js";
import { SaveImageAltOptimizerMetafiled } from "./metafields.js";
import { v4 as uuidv4 } from "uuid";

const fetchAllFromDataSource = async ({ session, query, datasource }) => {
  let allData = [];
  let hasNextPage = true;
  let variables = {
    first: 200,
    after: null,
  };

  const client = new shopify.api.clients.Graphql({
    apiVersion: "2024-10",
    session: session,
  });

  while (hasNextPage) {
    try {
      const response = await client.request(query, { variables });

      const products = response.data[`${datasource}`].edges.map(
        (edge) => edge.node
      );
      const pageInfo = response.data[`${datasource}`].pageInfo;
      const endCursor =
        response.data[`${datasource}`].edges.length > 0
          ? response.data[`${datasource}`].edges[
              response.data[`${datasource}`].edges.length - 1
            ].cursor
          : null;
      allData = allData.concat(products);

      // Check if there is a next page
      const hasNext = pageInfo.hasNextPage;
      if (hasNext) {
        variables = { ...variables, after: endCursor };
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      hasNextPage = false;
    }
  }

  return allData;
};

const translateAltText = (altTextSettings, owner, type, shop) => {
  const keywords = [
    "product.title",
    "product.vendor",
    "product.type",
    "product.vendor",
    "collection.title",
    "article.title",
    "article.author",
    "article.tags",
    "shop.name",
    "shop.domain",
  ];
  let altText = altTextSettings;

  keywords.forEach((keyword) => {
    const pattern = new RegExp(`\\{\\{\\s*${keyword}\\s*\\}\\}`, "g");
    const [ownerType, property] = keyword.split(".");
    let ownerData = null;

    if (ownerType.toLocaleLowerCase() == "shop") {
      switch (property.toLocaleLowerCase()) {
        case "name":
          ownerData = shop.name;
          break;
        case "domain":
          ownerData = shop.primaryDomain.host;
          break;
        default:
          ownerData = "";
          break;
      }
    } else if (
      ownerType.toLocaleLowerCase() == "product" &&
      type == "product"
    ) {
      switch (property.toLocaleLowerCase()) {
        case "title":
          ownerData = owner.title;
          break;
        case "vendor":
          ownerData = owner.vendor;
          break;
        case "type":
          ownerData = owner.productType;
          break;
        case "tags":
          ownerData = owner.tags.join(", ");
          break;
        default:
          ownerData = "";
          break;
      }
    } else if (
      ownerType.toLocaleLowerCase() == "collection" &&
      type == "collection"
    ) {
      if (property.toLocaleLowerCase() == "title") {
        ownerData = owner.title;
      }
    } else if (
      ownerType.toLocaleLowerCase() == "article" &&
      type == "article"
    ) {
      switch (property.toLocaleLowerCase()) {
        case "title":
          ownerData = owner.title;
          break;
        case "author":
          ownerData = owner.author.name;
          break;
        case "tags":
          ownerData = owner.tags.join(", ");
          break;
        default:
          ownerData = "";
          break;
      }
    }

    altText = altText.replace(pattern, ownerData);
  });

  return altText;
};

const updateImageAltManually = async ({
  session,
  shopData,
  datasource,
  metafieldData,
  type,
}) => {
  try {
    const client = new shopify.api.clients.Graphql({
      apiVersion: "2024-10",
      session,
    });
    const batchSize = 10;
    let start = 0,
      hasNextSlice = true;

    while (hasNextSlice) {
      const slice = datasource.slice(
        start,
        start + batchSize < datasource.length
          ? start + batchSize
          : datasource.length
      );

      let mutation_query = ``;
      slice.forEach((data, index) => {
        const altText = translateAltText(
          metafieldData.altText[`${type}`],
          data,
          type,
          shopData
        );

        if (type == "collection") {
          mutation_query += `collection_${index}: collectionUpdate(input: { id: "${data.id}", image: { altText: "${altText}" } }) {
                                userErrors {
                                  field
                                  message
                                }
                              }`;
        } else if (type == "article" && data.image) {
          mutation_query += `article_${index}: articleUpdate(article: { image: { altText: "${altText}", url: "${data.image.url}" } }, id: "${data.id}") {
                              userErrors {
                                field
                                message
                              }
                            }`;
        }
      });

      const response = await client.request(`mutation { ${mutation_query} }`);

      if (start + batchSize >= datasource.length) {
        hasNextSlice = false;
      } else start += batchSize;
    }
  } catch (error) {
    throw error;
  }
};

export const BulkUpdateAltText = async (req, res, next) => {
  try {
    const { altTextChenge } = req?.body?.data;
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({
      session,
    });
    await SaveImageAltOptimizerMetafiled(req, res, next);

    let metafieldData = null,
      shopData = await client.request(`
          query GetShopMetafield {
            shop {
                name
                primaryDomain {
                    id
                    host
                    url
                }
                metafield(key: "image-optimizer", namespace: "bs-23-seo-app") {
                    id
                    namespace
                    key
                    value
                }      
            }
          }`);

    if (shopData.data.shop.metafield) {
      metafieldData = JSON.parse(shopData.data.shop.metafield.value);
    }

    if (!metafieldData) {
      return res
        .status(400)
        .json({ message: "No optimization settings was specified" });
    }

    console.log("got metafield data");

    const input = [];
    if (altTextChenge.includes("product")) {
      console.log("getting all products");
      const allProducts = await fetchAllFromDataSource({
        datasource: "products",
        session: res.locals.shopify.session,
        query: `
      query ($first: Int!, $after: String) {
        products(first: $first, after: $after, reverse: true) {
          edges {
            node {
              id
              title
              productType
              vendor
              tags
              media(first: 250) {
                edges {
                  node {
                    id
                    alt
                    mediaContentType
                  }
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `,
      });

      console.log("got all products");

      allProducts.forEach((productData) => {
        const productAltText = translateAltText(
          metafieldData.altText.product,
          productData,
          "product",
          shopData.body.data.shop
        );

        productData.media.edges.forEach(({ node }) => {
          input.push({
            id: node.id,
            alt: productAltText,
          });
        });
      });

      const productImageUpdateResponse = await client.request(
        `
        mutation FileUpdate($input: [FileUpdateInput!]!) {
          fileUpdate(files: $input) {
            userErrors {
              code
              field
              message
            }
            files {
              alt
            }
          }
        }
        `,
        { variables: { input } }
      );

      console.log("product image alt updated successfully");
    }
    if (altTextChenge.includes("collection")) {
      console.log("getting all collection");
      const allCollections = await fetchAllFromDataSource({
        datasource: "collections",
        session: res.locals.shopify.session,
        query: `
        query ($first: Int!, $after: String) {
          collections(first: $first, after: $after, reverse: true) {
            edges {
              node {
                id
                title
                image {
                  id
                  altText
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      });

      console.log("got all collections");

      await updateImageAltManually({
        session: res.locals.shopify.session,
        shopData: shopData.body.data.shop,
        datasource: allCollections,
        type: "collection",
        metafieldData,
      });

      console.log("collection image alt updated successfully");
    }
    if (altTextChenge.includes("article")) {
      console.log("getting all collection");
      const allArticles = await fetchAllFromDataSource({
        datasource: "articles",
        session: res.locals.shopify.session,
        query: `
        query ($first: Int!, $after: String) {
          articles(first: $first, after: $after) {
            edges {
              node {
                id
                title
                author {
                  name
                }
                tags
                image {
                  id
                  altText
                  url
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
        `,
      });

      console.log("got all articles");

      await updateImageAltManually({
        session: res.locals.shopify.session,
        shopData: shopData.body.data.shop,
        datasource: allArticles,
        type: "article",
        metafieldData,
      });

      console.log("article image alt updated successfully");
    }

    return res.status(200).json({ message: "Bulk update alt text" });
  } catch (error) {
    console.error(error);
  }
};

function sanitizeFilename(filename) {
  const substrings = filename.split(/[^a-zA-Z0-9._-]+/);
  const filteredSubstrings = substrings.filter(Boolean);
  return filteredSubstrings.join("-");
}

function parseFilenameFromSrc(url) {
  const full_filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
  const filename_without_extension = full_filename.substring(
    0,
    full_filename.lastIndexOf(".")
  );
  const fileExtension = full_filename.substring(full_filename.lastIndexOf("."));
  return { filename: filename_without_extension, fileExt: fileExtension };
}

export const updateProductImageFilename = async (req, res, next) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });
    const { id, fileNameSettings, fileExt, productId } = req.body;
    const queryData = await client.request(`
          query QueryData{
            shop {
              name
              primaryDomain {
                id
                host
                url
              }
            }
            product(id: "${productId}") {
              id
              title
              productType
              vendor
              tags
            }          
          }`);

    const shop = queryData.data.shop,
      product = queryData.data.product;

    const filename = translateAltText(
      fileNameSettings,
      product,
      "product",
      shop
    );

    const input = [
      {
        id,
        filename: generateFileName(sanitizeFilename(filename + fileExt)),
      },
    ];

    const productImageFilenameUpdateResponse = await client.request(
      `
        mutation FileUpdate($input: [FileUpdateInput!]!) {
          fileUpdate(files: $input) {
            userErrors {
              code
              field
              message
            }
          }
        }
        `,
      { variables: { input } }
    );

    if (
      productImageFilenameUpdateResponse.data.fileUpdate.userErrors.length > 0
    ) {
      return res.status(400).json({
        message:
          productImageFilenameUpdateResponse.data.fileUpdate.userErrors?.[0]
            .message,
      });
    }
    const product_id = productId.split("/").pop();
    const productDataById = await getProductByID(
      res.locals.shopify.session,
      product_id
    );
    return res
      .status(200)
      .json({ message: "Product image filename updated", productDataById });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ message: "Error updating product image filename" });
  }
};

// async function batchUpdateImageFileName({ input, client }) {
//   function wait(ms) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   try {
//     console.log("starting batch update");
//     const batchSize = 10;
//     let start = 0,
//       hasNextSlice = true;

//     while (hasNextSlice) {
//       const slice = input.slice(start, start + batchSize);
//       const productImageFilenameUpdateResponse = await client.query({
//         data: {
//           query: `
//         mutation FileUpdate($input: [FileUpdateInput!]!) {
//           fileUpdate(files: $input) {
//             userErrors {
//               code
//               field
//               message
//             }
//             files {
//               id
//               fileStatus
//               fileErrors {
//                 code
//                 details
//                 message
//               }
//             }
//           }
//         }
//         `,
//           variables: { input: slice },
//         },
//       });

//       if (productImageFilenameUpdateResponse.body.data.fileUpdate.userErrors.length > 0) {
//         console.log("something happened");
//         console.log(productImageFilenameUpdateResponse.body.data.fileUpdate.userErrors);
//         // throw productImageFilenameUpdateResponse.body.data.fileUpdate
//         //   .userErrors;
//       }

//       if (start + batchSize >= input.length) {
//         hasNextSlice = false;
//       } else start += batchSize;

//       await wait(1000 * 30);
//     }

//     console.log("All product image filename updated successfully");
//     return true;
//   } catch (error) {
//     console.log("Error updating product image filename");
//     throw error;
//     return false;
//   }
// }

async function batchUpdateImageFileName({ input, client }) {
  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function updateFile(file, attempt = 1) {
    try {
      const productImageFilenameUpdateResponse = await client.request(
        `
            mutation FileUpdate($input: [FileUpdateInput!]!) {
              fileUpdate(files: $input) {
                userErrors {
                  code
                  field
                  message
                }
                files {
                  id
                  fileStatus
                  fileErrors {
                    code
                    details
                    message
                  }
                }
              }
            }
          `,
        { variables: { input: [file] } }
      );

      const userErrors =
        productImageFilenameUpdateResponse.data.fileUpdate.userErrors;
      if (userErrors.length > 0) {
        const fileLockedErrors = userErrors.filter(
          (error) => error.code === "FILE_LOCKED"
        );

        if (fileLockedErrors.length > 0) {
          console.log(`File locked for file ID ${file.id}, retrying...`);
          if (attempt <= 5) {
            const delay = Math.pow(2, attempt) * 200; // Exponential backoff
            await wait(delay);
            return await updateFile(file, attempt + 1);
          } else {
            console.log(`Max retries reached for file ID ${file.id}.`);
          }
        } else {
          console.log("Other errors encountered:", userErrors);
        }
      }
    } catch (error) {
      console.log(`Error updating file ID ${file.id}:`, error);
      throw error;
    }
  }

  try {
    console.log("Starting single-file updates");

    for (const file of input) {
      await updateFile(file);
      await wait(500); // Optional delay between files to avoid API rate limits
    }

    console.log("All product image filenames updated successfully");
    return true;
  } catch (error) {
    console.log("🚀 ~ batchUpdateImageFileName ~ error:", error);
    throw error;
  }
}

function generateFileName(originalName) {
  const uniqueId = uuidv4();
  const ext = extname(originalName);
  const baseName = basename(originalName, ext);
  return `${baseName}-${uniqueId}${ext}`;
}

async function saveGlobalImageFilenameToMetafield({ session, filename }) {
  try {
    const client = new shopify.api.clients.Graphql({
      apiVersion: "2024-10",
      session,
    });

    const initialQuery = await client.request(`{
                  metafieldDefinitions(first:1, namespace: "bs-23-seo-app", ownerType: SHOP, key: "image-optimizer") {
                    edges {
                      node {
                        id
                      }
                    }
                  }
                  shop {
                    id
                    metafield(namespace: "bs-23-seo-app", key: "image-optimizer") {
                      value
                    }
                  }
                }`);

    if (initialQuery.data.metafieldDefinitions.edges.length === 0) {
      const createMetafieldDefinition = await client.request(`mutation {
                    metafieldDefinitionCreate(definition: {
                      namespace: "bs-23-seo-app",
                      key: "image-optimizer",
                      type: "json",
                      name: "SEO app metafield",
                      description: "Metafield for storing image optimizer settings"
                      ownerType: SHOP
                    }) {
                      createdDefinition {
                        id
                      }
                      userErrors {
                        code
                        field
                      }
                    }
                  }`);

      if (
        createMetafieldDefinition.data.metafieldDefinitionCreate.userErrors
          .length > 0
      ) {
        throw createMetafieldDefinition.data.metafieldDefinitionCreate
          .userErrors;
      }
    }

    const shopId = initialQuery.data.shop.id;
    const prevData = initialQuery.data.shop.metafield
      ? JSON.parse(initialQuery.data.shop.metafield.value)
      : {};
    const setMetafield = await client.request(
      `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
                  metafieldsSet(metafields: $metafields) {
                    metafields {
                        id
                        key
                        namespace
                        value
                    }
                    userErrors {
                      field
                      message
                      code
                    }
                  }
                }`,
      {
        variables: {
          metafields: [
            {
              key: "image-optimizer",
              namespace: "bs-23-seo-app",
              ownerId: shopId,
              value: JSON.stringify({ ...prevData, filename }),
            },
          ],
        },
      }
    );

    if (setMetafield.data.metafieldsSet.userErrors.length > 0) {
      throw setMetafield.data.metafieldsSet.userErrors;
    }
  } catch (error) {
    throw error;
  }
}

export const bulkUpdateProductImageFilename = async (req, res, next) => {
  try {
    const { fileNameSettings } = req.body;

    await saveGlobalImageFilenameToMetafield({
      session: res.locals.shopify.session,
      filename: fileNameSettings,
    });

    const client = new shopify.api.clients.Graphql({
      apiVersion: "2024-10",
      session: res.locals.shopify.session,
    });
    const queryData = await client.request(`
          query QueryData{
            shop {
              name
              primaryDomain {
                id
                host
                url
              }
            }          
          }`);
    const shop = queryData.data.shop;

    const allProducts = await fetchAllFromDataSource({
      datasource: "products",
      session: res.locals.shopify.session,
      query: `
      query ($first: Int!, $after: String) {
        products(first: $first, after: $after, reverse: true) {
          edges {
            node {
              id
              title
              productType
              vendor
              tags
              media(first: 250) {
                edges {
                  node {
                    id
                    alt
                    mediaContentType
                    preview {
                      status
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `,
    });

    const input = [];
    allProducts.forEach((productData) => {
      productData.media.edges
        .filter((e) => e.node.mediaContentType === "IMAGE")
        .forEach(({ node }) => {
          const { fileExt } = parseFilenameFromSrc(node.preview.image.url);
          const filename = sanitizeFilename(
            translateAltText(fileNameSettings, productData, "product", shop)
          );
          input.push({
            id: node.id,
            filename: generateFileName(filename + fileExt),
          });
        });
    });

    await batchUpdateImageFileName({ input, client });

    return res.status(200).json({ message: "Product image filename updated" });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ message: "Error updating product image filename" });
  }
};
