export const validateFilename = (filename) => {
  // Define allowed characters including lowercase letters, numbers, dashes, underscores, and curly braces
  const validChars = /^[a-z0-9-{}_ ]+$/; // Allowing lowercase letters, numbers, dashes, underscores, curly braces, and spaces
  const startsWithLetterOrNumber = /^[a-z0-9]/;
  const consecutiveDashes = /--/; // Checks for consecutive dashes
  const consecutiveUnderscores = /__|_-|_-/; // Checks for invalid combinations with underscores
  const validPlaceholder = /^\{\{.*\}\}$/; // Check if it's a valid placeholder

  if (!filename) {
    return "Filename cannot be empty.";
  }

  if (validPlaceholder.test(filename)) {
    return null; // Allow filenames that are just placeholders
  }

  if (!validChars.test(filename)) {
    return "Filename contains invalid characters. Use only lowercase letters, numbers, dashes, underscores, or curly braces.";
  }

  if (!startsWithLetterOrNumber.test(filename)) {
    return "Filename must start with a lowercase letter or number.";
  }

  if (consecutiveDashes.test(filename)) {
    return "Filename contains consecutive dashes.";
  }

  if (consecutiveUnderscores.test(filename)) {
    return "Filename contains consecutive underscores or invalid combinations.";
  }

  if (filename.length > 150) {
    return "Filename must not exceed 50 characters.";
  }

  return null; // Valid filename
};
