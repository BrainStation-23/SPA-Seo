export function formatJSONResult(messyString) {
  const resultOnlyString = messyString.match(/"result":\s*{[^}]*}/);
  const jsonString = `{${resultOnlyString[0]}}`.replace(/\\"/g, '"');
  const response = jsonString ? JSON.parse(jsonString) : null;
  return response;
}
