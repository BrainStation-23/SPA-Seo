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
    const response = await this.openAiApi.createChatCompletion({
      model: deploymentName,
      messages: messages, //[{ role: "user", content: "hi and hello" }],
      max_tokens: 500, // Corrected parameter
      temperature: 0.9,
      top_p: 1, // Corrected to `top_p` as well
      presence_penalty: 0,
      frequency_penalty: 0,
    });

    return response;
  }
}

export default AzureOpenAIService;
