import sharp from "sharp";
import fetch from "node-fetch";
// import shopify from "../shopify";

export const compressImageWithSharp = async ({
  imageSrc,
  width,
  height,
  quality,
  format,
}) => {
  try {
    const response = await fetch(imageSrc);
    const buffer = await response.buffer();
    let imageSharp = sharp(buffer);

    if (width || height) {
      imageSharp = imageSharp.resize({
        width: width ? parseInt(width) : null,
        height: height ? parseInt(height) : null,
      });
    }

    if (format === "jpeg" || format === "jpg") {
      imageSharp = imageSharp.jpeg({ quality: parseInt(quality) });
    } else if (format === "png") {
      imageSharp = imageSharp.png();
    } else if (format === "webp") {
      imageSharp = imageSharp.webp({ quality: parseInt(quality) });
    } else if (format === "gif") {
      imageSharp = imageSharp.gif();
    }
    imageSharp = imageSharp.toFormat(format);

    const compressedImageBuffer = await imageSharp.toBuffer();
    const resultImage = compressedImageBuffer.toString("base64");

    return resultImage;
  } catch (err) {
    console.error("Error during image compression:", err);
    throw err;
  }
};

export const compressBulkImageWithSharp = async ({
  imageSrc,
  width,
  height,
  quality,
  format,
}) => {
  try {
  } catch (error) {
    console.error("Error during bulk image compression:", err);
    throw error;
  }
};

export const replaceOriginalImage = async ({
  session,
  resourceType,
  resourceId,
}) => {
  try {
  } catch (error) {
    console.error("Error during image update:", err);
    throw error;
  }
};
