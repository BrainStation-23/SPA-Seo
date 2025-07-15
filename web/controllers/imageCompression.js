import sharp from "sharp";
import fetch from "node-fetch";
import shopify from "../shopify.js";

import { compressImageWithSharp } from "../services/imageOptimizationService.js";
import { UploadImage } from "../utils/uploadToShopify.js";
import { getQueryData, queryDataWithVariables } from "../utils/getQueryData.js";

import { FileUpdate } from "../graphql/fileUpdate.js";
import { StagedUploadCreate } from "../graphql/stagedUploadsCreate.js";

export const handleImageCompressionRequest = async (req, res) => {
  try {
    const { imageId, fileName, imageUrl, resourceType, compressionSettings } =
      req.body;
    const imageBlob = await compressImageWithSharp({
      imageSrc: imageUrl,
      format: compressionSettings.format,
      height: compressionSettings.height,
      width: compressionSettings.width,
      quality: compressionSettings.quality,
    });

    const variables = {
      input: [
        {
          filename: fileName,
          mimeType: `image/${compressionSettings.format}`,
          httpMethod: "POST",
          resource: "PRODUCT_IMAGE",
        },
      ],
    };
    const mutationResponse = await queryDataWithVariables(
      res,
      StagedUploadCreate,
      variables
    );

    const uploadedImgUrl = await UploadImage({
      imageBlob,
      statedUploadUrl: mutationResponse.data.stagedUploadsCreate[0].url,
      parameters: mutationResponse.data.stagedUploadsCreate[0].parameters,
    });

    const fileUpdateVariables = {
      files: [
        {
          id: imageId,
          originalSource: uploadedImgUrl,
        },
      ],
    };
    const fileUpdateResponse = await queryDataWithVariables(
      res,
      FileUpdate,
      fileUpdateVariables
    );

    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Error during image compression or update:", err);
    res.status(500).json({
      success: false,
      error: "Image compression or update failed",
    });
  }
};

export const imageCompression = async (req, res) => {
  const {
    image,
    compressionSettings,
    replaceOrginalImage,
    imagePosition,
    altText,
    fileName,
  } = req.body;
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

    await client.post({
      path: `/products/${productId}/images.json`,
      data: {
        image: {
          product_id: productId,
          position: replaceOrginalImage ? imagePosition : 1,
          attachment: resultImage,
          alt: altText,
          filename: fileName,
        },
      },
    });
    if (replaceOrginalImage) {
      await client.delete({
        path: `/products/${productId}/images/${imageId}.json`,
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
