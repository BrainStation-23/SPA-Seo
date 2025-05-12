import shopify from "../shopify.js";

export const getQueryData = async (res, shopQuery) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.request(shopQuery);

    return response;
  } catch (error) {
    console.log("🚀 ~ getQueryData ~ error:", error);
    return error;
  }
};

export const queryDataWithVariables = async (res, query, variables) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.request(query, { variables });
    return response;
  } catch (error) {
    console.log("🚀 ~ queryDataWithVariables ~ error:", error);
    return error;
  }
};
