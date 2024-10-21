import sharp from "sharp";
import fetch from "node-fetch";
import shopify from "../shopify.js";

export const imageCompression = async (req, res) => {
  const { image, compressionSettings, replaceOrginalImage, imagePosition } = req.body;
  const { productId, imageId } = req.params;
  const { width, height, quality, format } = compressionSettings;

  try {
    const response = await fetch(image?.src);
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

    const client = new shopify.api.clients.Rest({
      session: res.locals.shopify.session,
    });

    const compressedImageBuffer = await imageSharp.toBuffer();
    const resultImage = compressedImageBuffer.toString("base64");
    if (replaceOrginalImage) {
      await client.put({
        path: `/products/${productId}/images/${imageId}.json`,
        data: {
          image: {
            product_id: productId,
            id: imageId,
            position: imagePosition,
            attachment: resultImage,
          },
        },
      });
    } else {
      await client.post({
        path: `/products/${productId}/images.json`,
        data: {
          image: {
            product_id: productId,
            position: 1,
            attachment: resultImage,
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Image compressed and updated successfully`,
    });
  } catch (err) {
    console.error("Error during image compression or update:", err);
    res.status(500).json({
      success: false,
      error: "Image compression or update failed",
    });
  }
};
