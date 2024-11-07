import shopify from "../shopify.js";
import { formatJSONResult } from "../utils/formatJSONResult.js";
import AzureOpenAIService from "../utils/getAIContext.js";
const seoAI = new AzureOpenAIService();

export const aiSeoContentController = async (req, res, next) => {
  try {
    const messages = [
      {
        role: "user",
        content: `Give me five suggestions for a meta title and description for a product like "apple". Each suggestion should include:
      1. Meta Title
      2. Meta Description 
      just give the results in JSON format like result: {metaTitle: [], metaDescription:[]}
      `,
      },
    ];
    const aiContent = await seoAI.getAIResults(messages);
    const message = aiContent?.data?.choices[0]?.message.content || "";
    const response = formatJSONResult(message);
    return res.status(200).json({
      status: "Success",
      aiContent: response,
    });
  } catch (err) {
    console.log("🚀 ~ aiSeoContentController ~ err:", err);

    res.status(400).json({ err });
  }
};
