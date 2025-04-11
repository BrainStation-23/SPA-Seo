import { Configuration, OpenAIApi } from "azure-openai";
import { apiKey, endPoint, deploymentName } from "../config/config.js";

class AzureOpenAIService {
  constructor() {
    this.openAiApi = new OpenAIApi(
      new Configuration({
        apiKey: apiKey,
        azure: {
          apiKey: apiKey,
          endpoint: endPoint,
          deploymentName: deploymentName,
        },
      })
    );
  }

  async getAIResults(messages) {
    try {
      const response = await this.openAiApi.createChatCompletion({
        model: deploymentName,
        messages: messages, //[{ role: "user", content: "hi and hello" }],
        max_tokens: 5000, // Corrected parameter
        temperature: 0.9,
        top_p: 1, // Corrected to `top_p` as well
        presence_penalty: 0,
        frequency_penalty: 0,
      });

      return response;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const retryAfter = error.response.headers["retry-after"] || "unknown";
        console.error(
          `Rate limit exceeded. Please retry after ${retryAfter} seconds.`
        );
        throw new Error(
          `Rate limit exceeded. Retry after ${retryAfter} seconds.`
        );
      }

      console.log("🚀 ~ AzureOpenAIService ~ getAIResults ~ error:", error);
      throw error; // Re-throw the error for other cases
    }
  }
}

export default AzureOpenAIService;
