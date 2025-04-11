import dotenv from "dotenv";

dotenv.config();

// Set your Azure OpenAI API key and endpoint
console.log("Configuring Azure OpenAI API settings...");
export const apiKey = process.env.AI_API_KEY;
export const endPoint = process.env.AI_API_ENDPOINT;
export const deploymentName = process.env.AI_DEPLOYMENT_NAME;
