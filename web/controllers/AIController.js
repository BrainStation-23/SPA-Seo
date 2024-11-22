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

async function generateBlogTitleWithAI(body) {
  const messages = [
    {
      role: "system",
      content: "You are a blog writer for a Shopify store",
    },
    {
      role: "user",
      content: `
      I'm writing a blog post about ${body.topic}.

      Come up with 5-7 possible titles for this prompt: ${body.prompt}.

      Make sure to include these keywords in the title: ${body.keywords}.

      All the titles should be no more than 60 characters in length. They should be engaging and interesting for an audience of ${body.audience}.

      The title should comply with the best practices for SEO. 
      For the suggestion please follow the seo guidelines.
      Response must be in JSON format like response: { result: {
        suggestion: "example"
      }}
    `,
    },
  ];

  const response = await generateWithAI(messages);
  return { response: response?.result?.suggestion, messages };
}

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Express.Response>}
 * @description Generates contnent for individual blog section
 * @requires Express.Request req body format
 * {
 *    heading: [ heading... ]
 * }
 */
export async function aiBlogContentController(req, res) {
  try {
    const body = req.body;
    const type = body.type;
    // const productInfo = await getProductByID(
    //   res.locals.shopify.session,
    //   body?.productId
    // );
    const messages = [
      {
        role: "system",
        content: "you are a blog writer for a Shopify store",
      },
      {
        role: "user",
        content: `Write an outline for a blog article based on this prompt: ${body.prompt}.

      Wirte 5 - 8 section titles for the blog article. You dont have to write the content for each section, just the titles.
      For the suggestion please follow the seo guidelines.
      Response must be in JSON format like response: { result: {
        suggestion: "example"
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
}
