import crypto from "crypto";

// Middleware to verify Shopify digital signature
export const verifyShopifySignature = (req, res, next) => {
  // Clone the query object to avoid modifying the original request
  const newSignature = { ...req.query };

  // Remove the 'signature' field from the query parameters
  delete newSignature.signature;

  // Get the app secret from environment variables
  const appSecret = process.env.SHOPIFY_API_SECRET;

  // Calculate the HMAC (hash-based message authentication code) signature
  const sig = calculateShopifyDigitalSignature(appSecret, newSignature);

  // Log the result for debugging
  console.log("verifyShopifySignature", sig === req.query.signature);

  // If the calculated signature doesn't match the one in the query, return an error
  if (sig !== req.query.signature) {
    return res.status(400).send("Invalid Request");
  }

  // If the signature is valid, move on to the next middleware or route handler
  next();
};

// Function to calculate the Shopify digital signature
function calculateShopifyDigitalSignature(secret, data) {
  const stringData = Object.entries(data) // Convert object to an array of [key, value] pairs
    .map(
      ([key, value]) =>
        `${key}=${Array.isArray(value) ? value.join(",") : value}`
    ) // Format each key-value pair
    .sort() // Sort lexicographically by the key
    .join(""); // Join all the sorted key-value pairs into a single string

  // Create the HMAC using sha256 and the app secret
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(stringData);

  // Return the resulting HMAC as a hex string
  return hmac.digest("hex");
}
