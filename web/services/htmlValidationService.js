const W3C_VALIDATOR_URL = "https://validator.w3.org/nu/";

/**
 * @typedef {Object} ValidationMessage
 * @property {"error"|"warning"|"info"} type
 * @property {string} [subType]
 * @property {string} message
 * @property {string} [extract]
 * @property {number} [lastLine]
 * @property {number} [firstColumn]
 * @property {number} [lastColumn]
 */

/**
 * @typedef {Object} ValidationServiceResult
 * @property {boolean} isValid
 * @property {string} validatedUrl - The URL that was validated.
 * @property {ValidationMessage[]} errors
 * @property {ValidationMessage[]} warnings
 * @property {ValidationMessage[]} validatorMessages - All raw messages from the validator.
 * @property {string|null} [errorMessage] - Error message if the validation process itself failed.
 */

/**
 * Validates a public URL using the W3C HTML validator service.
 * @param {string} urlToValidate - The public URL of the HTML page to validate.
 * @returns {Promise<ValidationServiceResult>} - An object containing validation status.
 */
const validateUrl = async (urlToValidate) => {
  const result = {
    isValid: false,
    validatedUrl: urlToValidate,
    errors: [],
    warnings: [],
    validatorMessages: [],
    errorMessage: null,
  };

  if (
    !urlToValidate ||
    typeof urlToValidate !== "string" ||
    !urlToValidate.startsWith("http")
  ) {
    result.errorMessage = "Invalid or missing URL provided for validation.";
    result.errors.push({ type: "error", message: result.errorMessage });
    console.warn(`HTMLValidationService: ${result.errorMessage}`);
    return result;
  }

  const validatorApiUrl = `${W3C_VALIDATOR_URL}?doc=${encodeURIComponent(
    urlToValidate
  )}&out=json&parser=html`;

  try {
    console.log(
      `HTMLValidationService: Validating URL: ${urlToValidate} using W3C service.`
    );
    const response = await fetch(validatorApiUrl, {
      // Uses global fetch
      method: "GET",
      headers: {
        "User-Agent":
          "Shopify App HTML Cleaner/1.0 (Requesting W3C Validation)", // Example User-Agent
      },
    });

    if (!response.ok) {
      const responseText = await response.text();
      result.errorMessage = `W3C Validator service responded with status ${
        response.status
      }: ${response.statusText}. Response: ${responseText.substring(0, 500)}`;
      console.error(`HTMLValidationService: ${result.errorMessage}`);
      result.errors.push({
        type: "error",
        message: `Validator service error: ${response.status}. Ensure the URL is publicly accessible and the validator service is not blocking requests.`,
      });
      return result;
    }

    const validationReport = await response.json();
    result.validatorMessages = validationReport.messages || [];

    if (Array.isArray(validationReport.messages)) {
      validationReport.messages.forEach((msg) => {
        const messageDetail = {
          type: msg.type,
          subType: msg.subType,
          message: msg.message
            ? msg.message.replace(/\s+/g, " ").trim()
            : "No message content from validator.",
          extract: msg.extract
            ? msg.extract.replace(/\s+/g, " ").trim().substring(0, 300) + "..."
            : undefined,
          lastLine: msg.lastLine,
          firstColumn: msg.firstColumn,
          lastColumn: msg.lastColumn,
        };
        if (
          msg.type === "error" ||
          msg.subType === "fatal" ||
          msg.type === "non-document-error"
        ) {
          result.errors.push(messageDetail);
        } else if (msg.type === "warning" || msg.type === "info") {
          result.warnings.push(messageDetail);
        }
      });
    }
    result.isValid = result.errors.length === 0;
  } catch (error) {
    console.error(
      `HTMLValidationService: Error during URL validation for ${urlToValidate}:`,
      error
    );
    result.errorMessage = `Validation process failed for ${urlToValidate}. Details: ${error.message}`;
    result.errors.push({ type: "error", message: result.errorMessage });
    // isValid remains false
  }

  if (result.isValid) {
    console.log(
      `HTMLValidationService: Validation successful for ${urlToValidate}. Warnings: ${result.warnings.length}`
    );
  } else {
    console.warn(
      `HTMLValidationService: Validation failed for ${urlToValidate}. Errors: ${result.errors.length}, Warnings: ${result.warnings.length}. Process error (if any): ${result.errorMessage}`
    );
  }
  return result;
};

export default {
  validateUrl,
};
