import { getQueryData, queryDataWithVariables } from "../utils/getQueryData.js";
import { inlineCriticalCss } from "../services/inlineCriticalCss.js";
import { getShopDetails } from "../graphql/optimizedLoading.js";

export const optimizedLoading = async (req, res) => {
  try {
    const queryResponse = await getQueryData(res, getShopDetails);
    const baseUrl = queryResponse.data.shop.url;
    console.log("Home Page URL:", baseUrl);
    await inlineCriticalCss(res, baseUrl, "bs23");

    res.status(200).json({
      success: true,
      message: "Puppeteer initiated successfully",
      shopDetails: queryResponse.data.shop,
    });
  } catch (error) {
    console.error("Error in optimizedLoading:", error);
    res.status(500).json({
      success: false,
      message: `Error in optimizedLoading: ${error.message}`,
    });
  }
};
