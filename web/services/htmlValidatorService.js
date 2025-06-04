import HTMLValidator from "html-validator";

const HTML_VALIDATOR_OPTIONS = {
  format: "json",
  // Note: `html-validator` often relies on a Java-based backend (like the v.Nu checker).
  // Ensure Java is installed and in the PATH on your server environment where this code runs.
  // If you have a self-hosted validator instance, you can specify its URL:
  // validator: 'http://localhost:8888', // Example if running v.Nu locally
  // Without specifying a validator, it might attempt to use a public one, which could be unreliable.
};

/**
 * @typedef {Object} ValidationMessage
 * @property {"error"|"warning"|"info"} type - The type of message.
 * @property {string} [subType] - e.g., "fatal".
 * @property {string} message - The validation message.
 * @property {string} [extract] - Snippet of HTML where the issue occurred.
 * @property {number} [lastLine] - Line number of the issue.
 * @property {number} [firstColumn] - Starting column of the issue.
 * @property {number} [lastColumn] - Ending column of the issue.
 */

/**
 * @typedef {Object} ValidationServiceResult
 * @property {boolean} isValid - True if the HTML has no validation errors.
 * @property {ValidationMessage[]} errors - Array of error messages from the validator.
 * @property {ValidationMessage[]} warnings - Array of warning messages from the validator.
 * @property {ValidationMessage[]} validatorMessages - All raw messages from the validator.
 */

/**
 * Validates an HTML string using the html-validator package.
 * @param {string} htmlString - The HTML content to validate.
 * @param {string} [assetKeyForLogging="Unknown Asset"] - Optional asset key for logging purposes.
 * @returns {Promise<ValidationServiceResult>} - An object containing validation status, errors, and warnings.
 */
const validateHtml = async (
  htmlString,
  assetKeyForLogging = "Unknown Asset"
) => {
  const result = {
    isValid: false,
    errors: [],
    warnings: [],
    validatorMessages: [],
  };

  if (
    !htmlString ||
    typeof htmlString !== "string" ||
    htmlString.trim() === ""
  ) {
    console.warn(
      `HTMLValidationService [${assetKeyForLogging}]: Received empty or invalid HTML string for validation.`
    );
    result.errors.push({
      type: "error",
      message: "No HTML content provided for validation.",
    });
    return result;
  }

  try {
    const validatorOutputString = await HTMLValidator({
      ...HTML_VALIDATOR_OPTIONS,
      data: htmlString,
    });

    const validationReport = JSON.parse(validatorOutputString);
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
          // Treat 'info' as a warning for simplicity
          result.warnings.push(messageDetail);
        }
      });
    }

    result.isValid = result.errors.length === 0;
  } catch (error) {
    console.error(
      `HTMLValidationService [${assetKeyForLogging}]: Error during HTML validation:`,
      error
    );
    let errorMessage = `HTML validation process failed for ${assetKeyForLogging}. `;
    if (
      error.message &&
      (error.message.toLowerCase().includes("java") ||
        error.message.includes("enoent") ||
        error.message.includes("spawn"))
    ) {
      errorMessage +=
        "The html-validator tool (or its Java dependency) may not be correctly installed or configured on the server.";
    } else if (error.message) {
      errorMessage += error.message;
    } else {
      errorMessage +=
        "An unknown error occurred with the html-validator package.";
    }
    result.errors.push({ type: "error", message: errorMessage });
    result.isValid = false;
  }

  return result;
};

export default {
  validateHtml,
};
