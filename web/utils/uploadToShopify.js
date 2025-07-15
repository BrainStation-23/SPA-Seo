function extractUrlFromXml(xml) {
  const locationTagStart = "<Location>";
  const locationTagEnd = "</Location>";
  const startIndex = xml.indexOf(locationTagStart) + locationTagStart.length;
  const endIndex = xml.indexOf(locationTagEnd);
  return xml.substring(startIndex, endIndex);
}

export async function UploadImage({ imageBlob, statedUploadUrl, parameters }) {
  const formData = new FormData();
  parameters.forEach((param) => {
    formData.append(param.name, param.value);
  });
  formData.append("file", imageBlob);

  const uploadResponse = await fetch(statedUploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    console.log("Failed to upload image");
    throw new Error(error);
  }

  const actualResourceUrl = extractUrlFromXml(await uploadResponse.text());
  console.log("actualResourceUrl", actualResourceUrl);
  return actualResourceUrl;
}
