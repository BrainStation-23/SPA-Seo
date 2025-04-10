import AzureOpenAIService from "../utils/getAIContext.js";
import { getCollectionByID, getCollections } from "./collections.js";
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
  } catch (error) {
    console.error("🚀 ~ aiSeoContentController ~ error:", error);

    // Handle specific error cases
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers["retry-after"] || "unknown";
      return res.status(429).json({
        status: "failed",
        error: `Rate limit exceeded. Please retry after ${retryAfter} seconds.`,
      });
    }

    // Handle other errors
    return res.status(400).json({
      status: "failed",
      error:
        error.message || "An error occurred while generating bulk SEO content",
    });
  }
};

async function generateWithAI(messages, isList) {
  try {
    const aiContent = await seoAI.getAIResults(messages);
    const message = aiContent?.data?.choices[0]?.message?.content || "";
    // console.log("🚀 ~ generateWithAI ~ message:", message);
    const jsonStart = message.indexOf("{");
    const jsonEnd = message.lastIndexOf("}") + 1;
    const jsonString = message.slice(jsonStart, jsonEnd);

    const response = JSON.parse(jsonString);
    return response?.result;
  } catch (error) {
    console.log("🚀 ~ generateWithAI ~ error:", error);
    throw error;
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
      suggestion: response?.suggestion,
    };
    return res.status(200).json({
      status: "Success",
      aiResult: newResult,
    });
  } catch (error) {
    console.error("🚀 ~ aiSeoBulkContent ~ error:", error);

    // Handle specific error cases
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers["retry-after"] || "unknown";
      return res.status(429).json({
        status: "failed",
        error: `Rate limit exceeded. Please retry after ${retryAfter} seconds.`,
      });
    }

    // Handle other errors
    return res.status(400).json({
      status: "failed",
      error:
        error.message || "An error occurred while generating bulk SEO content",
    });
  }
};

export const aiSeoBulkContent = async (req, res) => {
  try {
    const requestInfo = req.body;
    const productIds = requestInfo?.product?.map((p) => p.split("/").pop());
    let responseBody = [];
    if (requestInfo?.item === "collection") {
      const collectionList = await getCollections(
        res.locals.shopify.session,
        productIds
      );
      responseBody = collectionList?.collections?.edges;
    } else {
      const productsInfo = await getProducts(
        res.locals.shopify.session,
        productIds
      );

      responseBody = productsInfo?.products?.edges;
    }

    const messages = [
      {
        role: "user",
        content: `Give best suggestions for meta title and description for better seo. Product information like ${JSON.stringify(
          responseBody
        )}. Check the products/collections information. give the list of products/collections meta information. Response must be new suggestions every time"
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
    console.error("🚀 ~ aiSeoBulkContent ~ error:", error);

    // Handle specific error cases
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers["retry-after"] || "unknown";
      return res.status(429).json({
        status: "failed",
        error: `Rate limit exceeded. Please retry after ${retryAfter} seconds.`,
      });
    }

    // Handle other errors
    return res.status(400).json({
      status: "failed",
      error:
        error.message || "An error occurred while generating bulk SEO content",
    });
  }
};

export const blogGenerateAIContent = async (req, res) => {
  try {
    const {
      blog_topic,
      keywords,
      visibility,
      language,
      blog_tone,
      post_length,
      blog_ID,
    } = req.body;

    // Construct the AI prompt with a standard blog post format
    const messages = [
      {
        role: "user",
        content: `Generate a blog post based on the following details:
        - Blog Topic: ${blog_topic}
        - Keywords: ${keywords}
        - Language: ${language}
        - Blog Tone: ${blog_tone}
        - Post Length: ${post_length}
        
        Please ensure the content is well-structured, engaging, and optimized for SEO. The blog post should follow this standard format:
        1. **Title**: A catchy and relevant title for the blog.
        2. **Introduction**: A brief introduction to the topic that hooks the reader.
        3. **Main Content**: 
           - Use subheadings to divide the content into sections.
           - Provide detailed and informative content under each subheading.
           - Include examples, statistics, or quotes where applicable.
        4. **Conclusion**: Summarize the key points and provide a call-to-action (CTA) if relevant.
        5. **Meta Information**: Ensure the content includes meta title and meta description suggestions for SEO.

        The response must be in JSON format like:
        {
          "result": {
            "title": "Generated Blog Title",
            "content": "<p>Generated Blog Content in HTML format</p>",
            "metaTitle": "SEO Optimized Meta Title",
            "metaDescription": "SEO Optimized Meta Description"
          }
        }`,
      },
    ];

    // Call the AI service to generate the blog content
    const response = await generateWithAI(messages);

    // Extract the content and ensure it's in HTML format
    const aiContent = response?.content || "";
    const htmlContent = aiContent; // Assuming the AI already returns HTML content
    const title = response?.title || "Untitled Blog Post";
    //Create blog post

    // Return the generated content
    return res.status(200).json({
      status: "Success",
      aiResult: {
        title: title,
        content: htmlContent, // Ensure the content is sent as HTML
      },
    });
  } catch (error) {
    console.error("Error in blogGenerateAIContent:", error);
    return res.status(400).json({
      status: "failed",
      error: error.message || "An error occurred while generating blog content",
    });
  }
};

export const blogTitleReGenerate = async (req, res) => {
  try {
    const { blog_topic, keywords, language, blog_tone, previousTitle } =
      req.body;

    // Construct the AI prompt to regenerate the blog title
    const messages = [
      {
        role: "user",
        content: `Generate a catchy and SEO-optimized blog title based on the following details:
        - Blog Topic: ${blog_topic}
        - Keywords: ${keywords}
        - Language: ${language}
        - Blog Tone: ${blog_tone}
        - Previous generated title: ${previousTitle}
        
        Please ensure the title is engaging, relevant to the topic, and optimized for SEO. The response must be in JSON format like:
        {
          "result": {
            "title": "Generated Blog Title"
          }
        }`,
      },
    ];

    // Call the AI service to generate the blog title
    const response = await generateWithAI(messages);

    // Extract the title from the response
    const generatedTitle = response?.result?.title || "Untitled";

    // Return the generated title
    return res.status(200).json({
      status: "Success",
      aiResult: {
        title: generatedTitle,
      },
    });
  } catch (error) {
    console.error("Error in blogTitleReGenerate:", error);
    return res.status(400).json({
      status: "failed",
      error:
        error.message || "An error occurred while regenerating the blog title",
    });
  }
};
