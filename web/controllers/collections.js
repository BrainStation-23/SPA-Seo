import { fetchAllCollectionQuery } from "../graphql/collection.js";
import shopify from "../shopify.js";

const collectionQuery = (variables) => {
  let query = `
  query ($count: Int!, $cursor: String) {
    collections(first: $count, after: $cursor, reverse: true) {
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

const fetchAllCollections = async (session, variables) => {
  console.log("🚀 ~ fetchAllCollections ~ variables:", variables);
  const client = new shopify.api.clients.Graphql({
    session: session,
  });

  try {
    const query = collectionQuery(variables);
    const response = await client.query({
      data: {
        query: query,
        variables: variables,
      },
    });

    const collections = response.body.data.collections.edges.map(
      (edge) => edge.node
    );
    const pageInfo = response.body.data.collections.pageInfo;
    return { collections, pageInfo };
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
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
    const afterCursor = req?.query?.afterCursor;
    const beforeCursor = req?.query?.beforeCursor;
    const limit = req?.query?.limit;

    let variables = {
      count: +limit,
      cursor: afterCursor || beforeCursor || null,
      after: afterCursor || null,
      before: beforeCursor || null,
    };

    const collections = await fetchAllCollections(
      res.locals.shopify.session,
      variables
    );

    return res.status(200).json(collections);
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
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
      return res
        .status(400)
        .json({ error: response.body.data.collectionUpdate.userErrors });
    } else {
      const collectionByID = await getCollectionByID(
        res.locals.shopify.session,
        collectionID
      );
      return res.status(200).json({
        product: response.body.data.collectionUpdate.collection,
        collectionByID,
      });
    }
  } catch (error) {
    console.error(
      "Failed to update product SEO:",
      error.response?.errors || error.message
    );
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
      return res
        .status(400)
        .json({ error: response.body.data.collectionUpdate.userErrors });
    } else {
      const collectionByID = await getCollectionByID(
        res.locals.shopify.session,
        collectionID
      );
      console.log(
        "Updated product SEO:",
        response.body.data.collectionUpdate.collection
      );
      return res.status(200).json({
        product: response.body.data.collectionUpdate.collection,
        collectionByID,
      });
    }
  } catch (error) {
    console.error(
      "Failed to update product SEO:",
      error.response?.errors || error.message
    );
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

  console.log(
    "🚀 ~ updateProductBulkSeo ~ response:",
    response.body.data?.collectionUpdate_0?.userErrors
  );
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
      console.error(
        "Errors:",
        response.body.data.productImageUpdate.userErrors
      );
      return res
        .status(400)
        .json({ error: response.body.data?.productImageUpdate?.userErrors });
    } else {
      return res
        .status(200)
        .json({ product: response.body.data.productImageUpdate.image });
    }
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};

export const getCollections = async (session, collectionsIds) => {
  try {
    const pIds = collectionsIds.map((gid) => `id:${gid}`).join(" OR ");
    const queryString = await fetchAllCollectionQuery();
    const client = new shopify.api.clients.Graphql({ session });

    const collectionInfo = await client.query({
      data: {
        query: queryString,
        variables: {
          collectionIds: pIds,
        },
      },
    });
    return collectionInfo?.body?.data;
  } catch (error) {
    console.log("🚀 ~ getProducts ~ error:", error);
    throw error;
  }
};
