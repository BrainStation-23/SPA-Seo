import shopify from "../shopify.js";

const fetchAllCollections = async (session) => {
  let allCollections = [];
  let hasNextPage = true;
  let variables = {
    first: 200,
    after: null,
  };

  const query = `
    query ($first: Int!, $after: String) {
      collections(first: $first, after: $after, reverse: true) {
        edges {
          node {
            id
            title
            handle
            updatedAt
            sortOrder
            metafield(namespace: "bs-23-seo-app", key: "json-ld") {
              value
            }
            seo{
              title
              description
            }
            image {
              id
              url
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
  `;
  const client = new shopify.api.clients.Graphql({
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

      const collections = response.body.data.collections.edges.map((edge) => edge.node);
      const pageInfo = response.body.data.collections.pageInfo;
      const endCursor =
        response.body.data.collections.edges.length > 0
          ? response.body.data.collections.edges[response.body.data.collections.edges.length - 1].cursor
          : null;
      allCollections = allCollections.concat(collections);

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

  return allCollections;
};

export const getCollectionByID = async (session, id) => {
  try {
    const query = `
    query {
      collection(id: "gid://shopify/Collection/${id}") {
        id
        title
        description
        handle
        updatedAt
        image {
          id
          url
          originalSrc
          altText
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

    const collectionInfo = await client.query({ data: query });
    return collectionInfo?.body?.data?.collection;
  } catch (err) {
    console.log("🚀 ~ getProductByID ~ error:", err);
    throw err;
  }
};
export const getCollectionsController = async (req, res, next) => {
  try {
    const products = await fetchAllCollections(res.locals.shopify.session);

    return res.status(200).json(products);
  } catch (err) {
    console.log("🚀 ~ file: description.js:73 ~ descriptionController ~ err:", err);
    res.status(400).json({ err });
  }
};

export const updateCollectionSEO = async (req, res, next) => {
  try {
    const { id, seoTitle, seoDescription } = req.body;
    const collectionID = id?.split("/").pop();
    const mutation = `
    mutation updateCollection($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection {
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

    const response = await client.query({
      data: {
        query: mutation,
        variables: variables,
      },
    });

    if (response.body.data.collectionUpdate.userErrors.length > 0) {
      console.error("Errors:", response.body.data.collectionUpdate.userErrors);
      return res.status(400).json({ error: response.body.data.collectionUpdate.userErrors });
    } else {
      const collectionByID = await getCollectionByID(res.locals.shopify.session, collectionID);
      return res.status(200).json({ product: response.body.data.collectionUpdate.collection, collectionByID });
    }
  } catch (error) {
    console.error("Failed to update product SEO:", error.response?.errors || error.message);
  }
};

export const updateCollectionAltTextSEO = async (req, res, next) => {
  try {
    const { id, imageId, atlText } = req.body;
    const collectionID = id?.split("/").pop();
    const mutation = `
    mutation updateCollection($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection {
          id
          image {
            id
            altText
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
        image: {
          id: imageId,
          altText: atlText,
        },
      },
    };

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.query({
      data: {
        query: mutation,
        variables: variables,
      },
    });

    if (response.body.data.collectionUpdate.userErrors.length > 0) {
      console.error("Errors:", response.body.data.collectionUpdate.userErrors);
      return res.status(400).json({ error: response.body.data.collectionUpdate.userErrors });
    } else {
      const collectionByID = await getCollectionByID(res.locals.shopify.session, collectionID);
      console.log("Updated product SEO:", response.body.data.collectionUpdate.collection);
      return res.status(200).json({ product: response.body.data.collectionUpdate.collection, collectionByID });
    }
  } catch (error) {
    console.error("Failed to update product SEO:", error.response?.errors || error.message);
  }
};

export const updateCollectionBulkSeo = async (req, res) => {
  const { collections } = req.body;

  let query = ``;
  for (let i = 0; i < collections?.length; i++) {
    query += `collectionUpdate_${i}: collectionUpdate(input: {
      id: "${collections[i]?.id}",
      seo: {
        description: "${collections[i]?.seo_description}",
        title: "${collections[i]?.seo_title}",
      },
    }) {
      collection {
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

  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const response = await client.query({
    data: mutation,
  });

  console.log("🚀 ~ updateProductBulkSeo ~ response:", response.body.data?.collectionUpdate_0?.userErrors);
  if (response.body?.data?.collectionUpdate_0?.userErrors?.length > 0) {
    return res.status(400).json({ error: response.body.data });
  } else {
    return res.status(200).json({ product: response.body.data });
  }
};

export const updateImageSeoAltController = async (req, res, next) => {
  try {
    const { id, imageId, altText } = req.body;

    const mutation = `mutation productImageUpdate($productId: ID!, $image: ImageInput!) {
      productImageUpdate(productId: $productId, image: $image) {
        image {
          id
          altText
        }
        userErrors {
          field
          message
        }
      }
    }`;

    const variables = {
      productId: id,
      image: {
        id: imageId,
        altText: altText,
      },
    };

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.query({
      data: {
        query: mutation,
        variables: variables,
      },
    });

    if (response.body.data?.productImageUpdate?.userErrors?.length > 0) {
      console.error("Errors:", response.body.data.productImageUpdate.userErrors);
      return res.status(400).json({ error: response.body.data?.productImageUpdate?.userErrors });
    } else {
      return res.status(200).json({ product: response.body.data.productImageUpdate.image });
    }
  } catch (err) {
    console.log("🚀 ~ file: description.js:73 ~ descriptionController ~ err:", err);
    res.status(400).json({ err });
  }
};
