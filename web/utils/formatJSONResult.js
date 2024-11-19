export function formatJSONResult(messyString) {
  try {
    const resultOnlyString = messyString.match(/"result":\s*{[^}]*}/);
    //console.log("🚀 ~ formatJSONResult ~ resultOnlyString:", resultOnlyString);
    const jsonString = `{${resultOnlyString?.[0]}}`.replace(/\\"/g, '"');
    const response = jsonString ? JSON.parse(jsonString) : null;
    return response;
  } catch (error) {
    console.log("🚀 ~ formatJSONResult ~ error:", error);
    return error;
  }
}
