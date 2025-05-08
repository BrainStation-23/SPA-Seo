import { fetchAllProductsQuery } from "../graphql/product.js";
import shopify from "../shopify.js";

const fetchAllProducts = async (session, variables) => {
  const query = generateProductQuery(variables);
  console.log("🚀 ~ fetchAllProducts ~ query:", query);

  const client = new shopify.api.clients.Graphql({
    session: session,
  });

  const response = await client.request(query, { variables });

  const pageInfo = response.data.products.pageInfo;
  const products = response.data.products.edges;

  return { products, pageInfo };
};

const generateProductQuery = (variables) => {
  let query = `
    query ($count: Int!, $cursor: String${
      variables?.searchTerm ? ", $searchTerm: String" : ""
    }) {
      products(first: $count, after: $cursor, ${
        variables?.searchTerm ? "query: $searchTerm," : ""
      } reverse: true, sortKey: CREATED_AT) {
        edges {
          node {
            id
            title
            description
            handle
            status
            handle
            tags
            vendor
            priceRangeV2 {
              maxVariantPrice {
                amount
                currencyCode
              }
              minVariantPrice {
                amount
                currencyCode
              }
            }
            metafield(namespace: "bs-23-seo-app", key: "json-ld") {
              value
            }
            seo {
              title
              description
            }
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
            featuredImage{
              altText
              url
              width
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  `;
  if (variables?.before) {
    query = query.replace("first:", "last:");
    query = query.replace("after:", "before:");
  }
  return query;
};

export const productsController = async (req, res, next) => {
  try {
    const afterCursor = req?.query?.afterCursor;
    const beforeCursor = req?.query?.beforeCursor;
    const limit = req?.query?.limit;
    const searchTerm = req?.query?.searchTerm;
    let variables = {
      count: +limit,
      cursor: afterCursor || beforeCursor || null,
      after: afterCursor || null,
      before: beforeCursor || null,
      searchTerm: searchTerm
        ? /^\d+$/.test(searchTerm)
          ? `id:${searchTerm}`
          : `title:*${searchTerm}*`
        : null,
    };

    const data = await fetchAllProducts(res.locals.shopify.session, variables);

    return res.status(200).json(data);
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};

export const getProductByID = async (session, id) => {
  try {
    const query = `
    query {
      product(id: "gid://shopify/Product/${id}") {
        id
        title
        description
        status
        handle
        tags
        vendor
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
        featuredImage {
          altText
          url
          width
        }
        seo {
          description
          title
        }
        metafield(namespace: "bs-23-seo-app", key: "json-ld") {
          value
        }
      }
    }
  `;

    const client = new shopify.api.clients.Graphql({ session });

    const productInfo = await client.request(query);
    return productInfo?.data?.product;
  } catch (err) {
    console.log("🚀 ~ getProductByID ~ error:", err);
    throw err;
  }
};
export const getProductControllerByID = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ id",
      id
    );

    const response = await shopify.api.rest.Product.find({
      session: res.locals.shopify.session,
      id: id,
      fields: "id,images,title,metafields_global_title_tag",
    });

    return res.status(200).json(response);
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};

export const updateProductSEO = async (req, res, next) => {
  try {
    const { id, seoTitle, seoDescription } = req.body;

    const productID = id?.split("/").pop();
    const mutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          seo{
            description
            title
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

    const variables = {
      input: {
        id: id,
        seo: {
          description: seoDescription,
          title: seoTitle,
        },
      },
    };

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.request(mutation, { variables });

    if (response.data.productUpdate.userErrors.length > 0) {
      console.error("Errors:", response.data.productUpdate.userErrors);
      return res
        .status(400)
        .json({ error: response.data.productUpdate.userErrors });
    } else {
      const productByID = await getProductByID(
        res.locals.shopify.session,
        productID
      );
      return res.status(200).json({
        product: response.data.productUpdate.product,
        productByID,
      });
    }
  } catch (error) {
    console.error(
      "Failed to update product SEO:",
      error.response?.errors || error.message
    );
  }
};

export const getProducts = async (session, productsIds) => {
  try {
    const pIds = productsIds.map((gid) => `id:${gid}`).join(" OR ");
    const queryString = await fetchAllProductsQuery();
    const client = new shopify.api.clients.Graphql({ session });

    const productsInfo = await client.request(queryString, {
      variables: {
        productIds: pIds,
      },
    });
    return productsInfo?.data;
  } catch (error) {
    console.log("🚀 ~ getProducts ~ error:", error);
    throw error;
  }
};

export const updateProductBulkSeo = async (req, res) => {
  const { products } = req.body;

  let query = ``;
  for (let i = 0; i < products.length; i++) {
    query += `productUpdate_${i}: productUpdate(input: {
      id: "${products[i]?.id}",
      seo: {
        description: "${products[i]?.seo_description}",
        title: "${products[i]?.seo_title}",
      },
    }) {
      product {
        id
        title
        seo{
          description
          title
        }
      }
      userErrors {
        field
        message
      }
    }`;
  }

  const mutation = `mutation {
    ${query}
  }`;
  console.log("🚀 ~ updateProductBulkSeo ~ mutation:", mutation);

  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const response = await client.request(mutation);

  console.log(
    "🚀 ~ updateProductBulkSeo ~ response:",
    response.data?.productUpdate_0?.userErrors
  );
  if (response?.data?.productUpdate_0?.userErrors?.length > 0) {
    return res.status(400).json({ error: response.data });
  } else {
    return res.status(200).json({ product: response.data });
  }
};

export const updateImageSeoAltController = async (req, res, next) => {
  try {
    console.log("tryyyy");
    const { id, imageId, altText } = req.body;
    const productID = id?.split("/").pop();
    console.log("pid", productID, id, imageId, altText);
    // const mutation = `mutation productImageUpdate($productId: ID!, $image: ImageInput!) {
    //   productImageUpdate(productId: $productId, image: $image) {
    //     image {
    //       id
    //       altText
    //     }
    //     userErrors {
    //       field
    //       message
    //     }
    //   }
    // }`;
    const mutation = `mutation productUpdateMedia($media: [UpdateMediaInput!]!, $productId: ID!) {
  productUpdateMedia(media: $media, productId: $productId) {
    media {
      id
      alt
    }
    userErrors {
        field
        message
    }
  }
}`;
    const variables = {
      productId: id,
      media: [
        {
          id: imageId,
          alt: altText,
        },
      ],
    };

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.request(mutation, { variables });

    if (response.data?.productImageUpdate?.userErrors?.length > 0) {
      console.error("Errors:", response.data.productImageUpdate.userErrors);
      return res
        .status(400)
        .json({ error: response.data?.productUpdateMedia?.userErrors });
    } else {
      const productByID = await getProductByID(
        res.locals.shopify.session,
        productID
      );
      return res.status(200).json({
        product: response.data.productUpdateMedia.media,
        productByID,
      });
    }
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};

export const showOrHideProductHighlightController = async (req, res, next) => {
  try {
    const { id, checked } = req.body;

    const metafield = new shopify.api.rest.Metafield({
      session: res.locals.shopify.session,
    });
    metafield.product_id = id;
    metafield.namespace = "check_highlight";
    metafield.key = "check_product_highlight";
    metafield.value = checked ? "yes" : "no";
    metafield.type = "single_line_text_field";
    await metafield.save({
      update: true,
    });

    return res.status(200).json(metafield?.value);
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};
