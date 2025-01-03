import shopify from "../shopify.js";
import { formatJSONResult } from "../utils/formatJSONResult.js";
import AzureOpenAIService from "../utils/getAIContext.js";
import { getProductByID } from "./products.js";

const seoAI = new AzureOpenAIService();

export const aiSeoContentController = async (req, res, next) => {
  try {
    const requestInfo = req?.body;
    const productInfo = await getProductByID(
      res.locals.shopify.session,
      requestInfo?.productId
    );

    const messages = [
      {
        role: "user",
        content: `Give me five suggestions for meta title and description for better seo. Product information like ${JSON.stringify(
          productInfo
        )}. Check the product information and ${
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

async function generateWithAI(messages) {
  try {
    const aiContent = await seoAI.getAIResults(messages);
    const message = aiContent?.data?.choices[0]?.message.content || "";
    const response = formatJSONResult(message);
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
