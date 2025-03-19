import {
  formatJSONResult,
  formatJSONResultForList,
} from "../utils/formatJSONResult.js";
import AzureOpenAIService from "../utils/getAIContext.js";
import { getCollectionByID } from "./collections.js";
import { getProductByID, getProducts } from "./products.js";

const seoAI = new AzureOpenAIService();

export const aiSeoContentController = async (req, res, next) => {
  try {
    const requestInfo = req?.body;
    let responseInfo = {};
    if (requestInfo?.item === "collection") {
      responseInfo = await getCollectionByID(
        res.locals.shopify.session,
        requestInfo?.productId
      );
    } else {
      responseInfo = await getProductByID(
        res.locals.shopify.session,
        requestInfo?.productId
      );
    }
    console.log(
      "🚀 ~ aiSeoContentController ~ responseInfo:",
      requestInfo,
      responseInfo
    );

    const messages = [
      {
        role: "user",
        content: `Give me five suggestions for meta title and description for better seo. Product information like ${JSON.stringify(
          responseInfo
        )}. Check the information and ${
          requestInfo?.suggestionKeywords
            ? `please consider these keywords: ${requestInfo?.suggestionKeywords}, for generating content`
            : "response must be new suggestions every time"
        }. Each suggestion should include:
      1. Meta Title
      2. Meta Description
      Response must be in JSON format like response: { result: {metaTitle: [], metaDescription:[]}}
      `,
      },
    ];

    const response = await generateWithAI(messages);
    return res.status(200).json({
      status: "Success",
      aiContent: response,
    });
  } catch (err) {
    console.log("🚀 ~ aiSeoContentController ~ err:", err);

    res.status(400).json({ err });
  }
};

async function generateWithAI(messages, isList) {
  try {
    const aiContent = await seoAI.getAIResults(messages);
    const message = aiContent?.data?.choices[0]?.message.content || "";
    // console.log("🚀 ~ generateWithAI ~ message:", message);
    const response = isList
      ? formatJSONResultForList(message)
      : formatJSONResult(message);
    return response;
  } catch (error) {
    console.log("🚀 ~ generateWithAI ~ error:", error);
  }
}

export const aiSeoSingleContent = async (req, res) => {
  try {
    const body = req.body;
    const productInfo = await getProductByID(
      res.locals.shopify.session,
      body?.productId
    );
    const messages = [
      {
        role: "user",
        content: `Give your best suggestions based on this prompt: ${
          body.prompt
        } for ${
          body?.name === "ai_metaTitle_title"
            ? "Meta Title"
            : "Meta Description"
        } for better seo. Product information like ${JSON.stringify(
          productInfo
        )}.
      For the suggestion please follow the seo guidelines.
      Response must be in JSON format like response: { result: {
        suggestion:"example"
      }}
      `,
      },
    ];

    const response = await generateWithAI(messages);
    const newResult = {
      ...req.body,
      suggestion: response?.result?.suggestion,
    };
    return res.status(200).json({
      status: "Success",
      aiResult: newResult,
    });
  } catch (error) {
    console.log("🚀 ~ aiSeoSingleContent ~ error:", error);
  }
};

export const aiSeoBulkContent = async (req, res) => {
  try {
    const requestInfo = req.body;
    const productIds = requestInfo?.product?.map((p) => p.split("/").pop());
    const productsInfo = await getProducts(
      res.locals.shopify.session,
      productIds
    );

    const productList = productsInfo?.products?.edges;

    const messages = [
      {
        role: "user",
        content: `Give best suggestions for meta title and description for better seo. Product information like ${JSON.stringify(
          productList
        )}. Check the products information. give the list of products meta information. Response must be new suggestions every time"
          }. suggestion should include:
          1. Meta Title
          2. Meta Description
          Response must be in JSON format like response: 
          { result: [
              {metaTitle: example, metaDescription:example, productId: each ID, productTitle: each tile}
             ] 
          }
            give the full response. meta title must be 70 characters or fewer. meta description must be 160 characters or fewer.
          `,
      },
    ];

    const response = await generateWithAI(messages, true);

    const newResult = {
      ...req.body,
      suggestions: response,
    };

    return res.status(200).json({
      status: "Success",
      aiResult: newResult,
    });
  } catch (error) {
    console.log("🚀 ~ aiSeoSingleContent ~ error:", error);
  }
};
