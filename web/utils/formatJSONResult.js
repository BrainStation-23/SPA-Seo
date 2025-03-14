export function formatJSONResult(messyString) {
  try {
    const resultOnlyString = messyString.match(/"result":\s*{[^}]*}/);
    const jsonString = `{${resultOnlyString?.[0]}}`.replace(/\\"/g, '"');
    // console.log("🚀 ~ formatJSONResult ~ jsonString:", jsonString);
    const response = jsonString ? JSON.parse(jsonString) : null;
    return response;
  } catch (error) {
    console.log("🚀 ~ formatJSONResult ~ error:", error);
    return error;
  }
}

export function formatJSONResultForList(messyString) {
  try {
    // Match `"result": [...]` capturing arrays
    const match = messyString.match(/"result"\s*:\s*(\[[\s\S]*\])/);

    if (!match || !match[1]) {
      throw new Error("No 'result' array found in the input string");
    }

    // Extract the matched JSON string
    const jsonString = match[1];

    // console.log("🚀 ~ formatJSONResultForList ~ jsonString:", jsonString);

    // Parse JSON safely
    const response = JSON.parse(jsonString);
    return response;
  } catch (error) {
    console.error("🚀 ~ formatJSONResultForList ~ error:", error);
    return null;
  }
}
