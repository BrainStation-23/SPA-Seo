import shopify from "../shopify.js";
import {
  CheckShopMetafieldDefinition,
  CreateShopMetafieldDefinition,
  GetShopId,
  GetShopMetafield,
  GetProductMetafield,
  GetCollectionMetafield,
  GetArticleMetafield,
  SetShopMetafield,
} from "../graphql/metafields.js";
import { getProductByID } from "./products.js";
import { getCollectionByID } from "./collections.js";
import { getArticleById } from "./blog.js";
async function initializeMetafield(client, type, functionType) {
  try {
    console.log("initializing metafield", type);
    const namespace = "bs-23-seo-app";
    const key = functionType === "jsonld" ? "json-ld" : functionType === "image" ? "image-optimizer" : "";
    const description =
      functionType === "jsonld"
        ? "Metafield for generating json-ld for SEO"
        : functionType === "image"
        ? "Metafield for storing image optimizer settings"
        : "";
    const response = await client.query({
      data: {
        query: CheckShopMetafieldDefinition(type, namespace, key),
      },
    });

    if (response.body.data.metafieldDefinitions.edges.length == 0) {
      const metafieldCreationResponse = await client.query({
        data: {
          query: CreateShopMetafieldDefinition(type, namespace, key, description),
        },
      });

      if (metafieldCreationResponse.body.data.metafieldDefinitionCreate.userErrors.length > 0) {
        throw new Error({
          status: 400,
          error: metafieldCreationResponse.body.data.metafieldDefinitionCreate.userErrors,
        });
      }

      return {
        status: 200,
        message: "Created a new metafield definition",
        data: metafieldCreationResponse.body.data.metafieldDefinitionCreate,
      };
    }

    return {
      status: 200,
      message: "Metafield definition already exists",
      data: response.body.data,
    };
  } catch (error) {
    throw error;
  }
}

async function manageArticleMetafield(session, ownerId, blogId, data, active) {
  try {
    const metafield = new shopify.api.rest.Metafield({
      session,
    });
    metafield.article_id = ownerId;
    metafield.namespace = "bs-23-seo-app";
    metafield.key = "json-ld";
    metafield.type = "json";
    metafield.value = JSON.stringify({ article: data, active });
    await metafield.save({
      update: true,
    });
  } catch (error) {
    console.error(error);
  }
}

export const MetafieldCreate = async (req, res, next) => {
  try {
    let { type, data, owner, ownerId, blogId } = req.body;
    let ownerNumberId = owner === "ARTICLE" ? ownerId : ownerId?.split("/").pop();

    if (owner == "ARTICLE") {
      await manageArticleMetafield(res.locals.shopify.session, ownerId, blogId, data, req.body.active);

      return res.status(200).json({
        message: "saved metafield successfully",
      });
    }

    const client = new shopify.api.clients.Graphql({
      apiVersion: "2024-10",
      session: res.locals.shopify.session,
    });
    console.log("initializing metafield", ownerId);

    await initializeMetafield(client, owner, "jsonld");
    let prevData = {};

    if (owner == "SHOP") {
      prevData = await client.query({
        data: {
          query: GetShopMetafield({
            namespace: "bs-23-seo-app",
            key: "json-ld",
          }),
        },
      });
    } else if (owner == "PRODUCT") {
      prevData = await client.query({
        data: {
          query: GetProductMetafield(ownerId),
        },
      });
    } else if (owner == "COLLECTION") {
      prevData = await client.query({
        data: {
          query: GetCollectionMetafield(ownerId),
        },
      });
    } else if (owner == "ARTICLE") {
      ownerId = `gid://shopify/Article/${ownerId}`;
      prevData = await client.query({
        data: {
          query: GetArticleMetafield(ownerId),
        },
      });
    }

    if (prevData.body.data[`${owner.toLowerCase()}`].metafield) {
      prevData = JSON.parse(prevData.body.data[`${owner.toLowerCase()}`].metafield.value);
    } else {
      prevData = {};
    }

    let shopId = await client.query({
      data: {
        query: GetShopId,
      },
    });
    shopId = shopId.body.data.shop.id;
    if (ownerId == null) ownerId = shopId;
    const setMetafieldResponse = await client.query({
      data: {
        query: SetShopMetafield,
        variables: {
          metafields: [
            {
              key: "json-ld",
              namespace: "bs-23-seo-app",
              ownerId,
              value: JSON.stringify({
                ...prevData,
                [type]: data,
                active: req.body.active,
              }),
            },
          ],
        },
      },
    });

    if (setMetafieldResponse.body.data.metafieldsSet.userErrors.length > 0) {
      return res.status(400).json({
        error: setMetafieldResponse.body.data.metafieldsSet.userErrors,
      });
    }
    let dataByID = {};
    if (owner == "PRODUCT") {
      dataByID = await getProductByID(res.locals.shopify.session, ownerNumberId);
    } else if (owner == "COLLECTION") {
      dataByID = await getCollectionByID(res.locals.shopify.session, ownerNumberId);
    } else if (owner == "ARTICLE") {
      dataByID = await getArticleById(res.locals.shopify.session, ownerNumberId);
    }
    return res.status(200).json({
      dataByID,
      owner,
      message: "saved metafield successfully",
    });
  } catch (error) {
    console.error("Failed to create shop metafield:", error.response?.errors || error.message);
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const GetImageOptimizerSettings = async (req, res, next) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    let metafieldData = await client.query({
      data: {
        query: GetShopMetafield({
          namespace: "bs-23-seo-app",
          key: "image-optimizer",
        }),
      },
    });

    if (metafieldData.body.data.shop.metafield) {
      metafieldData = JSON.parse(metafieldData.body.data.shop.metafield.value);
    } else {
      metafieldData = null;
    }

    return res.status(200).json({
      message: "Retrived metafield successfully",
      data: metafieldData,
    });
  } catch (error) {
    console.error("Failed to get shop metafield:", error.response?.errors || error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const SaveImageAltOptimizerMetafiled = async (req, res, nest) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });
    let { data, type } = req.body;
    console.log("data", data, type);
    await initializeMetafield(client, "SHOP", "image");

    let metafieldData = await client.query({
      data: {
        query: GetShopMetafield({
          namespace: "bs-23-seo-app",
          key: "image-optimizer",
        }),
      },
    });

    if (metafieldData.body.data.shop.metafield) {
      metafieldData = JSON.parse(metafieldData.body.data.shop.metafield.value);
    } else {
      metafieldData = null;
    }

    let shopId = await client.query({
      data: {
        query: GetShopId,
      },
    });
    shopId = shopId.body.data.shop.id;

    const setMetafieldResponse = await client.query({
      data: {
        query: SetShopMetafield,
        variables: {
          metafields: [
            {
              key: "image-optimizer",
              namespace: "bs-23-seo-app",
              ownerId: shopId,
              value: JSON.stringify({
                ...metafieldData,
                [type === "altText" ? "altText" : "fileName"]: data,
              }),
            },
          ],
        },
      },
    });

    if (setMetafieldResponse.body.data.metafieldsSet.userErrors.length > 0) {
      throw new Error({
        error: setMetafieldResponse.body.data.metafieldsSet.userErrors,
      });
    }
    return;
  } catch (error) {
    throw error;
  }
};

export const SaveImageOptimizerSettings = async (req, res, nest) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });
    let { data, type } = req.body;
    console.log("data", data, type);
    await initializeMetafield(client, "SHOP", "image");

    let metafieldData = await client.query({
      data: {
        query: GetShopMetafield({
          namespace: "bs-23-seo-app",
          key: "image-optimizer",
        }),
      },
    });

    if (metafieldData.body.data.shop.metafield) {
      metafieldData = JSON.parse(metafieldData.body.data.shop.metafield.value);
    } else {
      metafieldData = null;
    }

    let shopId = await client.query({
      data: {
        query: GetShopId,
      },
    });
    shopId = shopId.body.data.shop.id;

    const setMetafieldResponse = await client.query({
      data: {
        query: SetShopMetafield,
        variables: {
          metafields: [
            {
              key: "image-optimizer",
              namespace: "bs-23-seo-app",
              ownerId: shopId,
              value: JSON.stringify({
                ...metafieldData,
                [type === "altText" ? "altText" : "fileName"]: data,
              }),
            },
          ],
        },
      },
    });

    if (setMetafieldResponse.body.data.metafieldsSet.userErrors.length > 0) {
      throw new Error({
        error: setMetafieldResponse.body.data.metafieldsSet.userErrors,
      });
    }
    return res.status(200).json({
      message: "Saved settings successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const GetMetafields = async (req, res, next) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    let metafieldData = await client.query({
      data: {
        query: GetShopMetafield({
          namespace: "bs-23-seo-app",
          key: "json-ld",
        }),
      },
    });

    if (metafieldData.body.data.shop.metafield) {
      metafieldData = JSON.parse(metafieldData.body.data.shop.metafield.value);
    } else {
      metafieldData = null;
    }

    return res.status(200).json({
      message: "Retrived metafield successfully",
      data: metafieldData,
    });
  } catch (error) {
    console.error("Failed to get shop metafield:", error.response?.errors || error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
