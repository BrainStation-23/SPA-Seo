import shopify from "../shopify.js";

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
      const response = await client.query({
        data: {
          query: query,
          variables: variables,
        },
      });

      const products = response.body.data[`${datasource}`].edges.map(
        (edge) => edge.node
      );
      const pageInfo = response.body.data[`${datasource}`].pageInfo;
      const endCursor =
        response.body.data[`${datasource}`].edges.length > 0
          ? response.body.data[`${datasource}`].edges[
              response.body.data[`${datasource}`].edges.length - 1
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

      const response = await client.query({
        data: {
          query: `mutation { ${mutation_query} }`,
        },
      });

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
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    let metafieldData = null,
      shopData = await client.query({
        data: {
          query: `
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
          }`,
        },
      });

    if (shopData.body.data.shop.metafield) {
      metafieldData = JSON.parse(shopData.body.data.shop.metafield.value);
    }

    if (!metafieldData) {
      return res
        .status(400)
        .json({ message: "No optimization settings was specified" });
    }

    console.log("got metafield data");

    const input = [];
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

    const productImageUpdateResponse = await client.query({
      data: {
        query: `
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
        variables: { input },
      },
    });

    console.log("product image alt updated successfully");

    await updateImageAltManually({
      session: res.locals.shopify.session,
      shopData: shopData.body.data.shop,
      datasource: allCollections,
      type: "collection",
      metafieldData,
    });

    console.log("collection image alt updated successfully");

    await updateImageAltManually({
      session: res.locals.shopify.session,
      shopData: shopData.body.data.shop,
      datasource: allArticles,
      type: "article",
      metafieldData,
    });

    console.log("article image alt updated successfully");

    return res.status(200).json({ message: "Bulk update alt text" });
  } catch (error) {
    console.error(error);
  }
};

export const BulkUpdateFileName = async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Bulk update file name" });
  } catch (error) {
    console.error(error);
  }
};
