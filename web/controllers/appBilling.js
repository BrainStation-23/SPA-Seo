import {
  subscriptionCancel,
  activeSubscription,
  subscriptionCreate,
} from "../utils/query.js";
import { queryDataWithVariables, getQueryData } from "../utils/getQueryData.js";
import SpeedInsights from "../models/speedInsights.js";

export const getActiveSubscription = async (req, res) => {
  try {
    let speedData = await SpeedInsights.findOne({
      platformStoreURL: res.locals.shopify.session?.shop,
    });

    if (!speedData) {
      speedData = {
        platformStoreURL: res.locals.shopify.session?.shop,
        isInstantPage: true,
        isLazyLoading: false,
        isStreamLineLoading: false,
        isOptimizedLoading: false,
        isAssetFileOptimization: false,
        isStreamlineCode: false,
      };
    }
    const query = activeSubscription();

    const appSubscription = await getQueryData(res, query);

    if (appSubscription?.errors) {
      return res.status(400).json({
        errors: appSubscription.errors,
      });
    } else if (
      appSubscription?.data?.appInstallation?.userErrors?.[0]?.message
    ) {
      return res.status(400).json({
        errors: appSubscription.data?.appInstallation?.userErrors?.[0],
      });
    }
    res.status(200).json({
      activeSubscription:
        appSubscription.data?.appInstallation?.activeSubscriptions?.[0] || {},
      speedInsights: speedData,
      message: "Success",
    });
  } catch (error) {
    console.log("🚀 ~ getActiveSubscription ~ error:", error);
    return res.status(400).json({
      error: error,
    });
  }
};

export const createAppSubscription = async (req, res, next) => {
  try {
    const subsData = req.body;
    let variables = {
      name: subsData?.name,
      returnUrl: `https://${res.locals.shopify.session?.shop}/admin/apps/${process.env.SHOPIFY_API_KEY}`,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: {
                amount: subsData?.amount,
                currencyCode: "USD",
              },
              interval: subsData?.interval,
            },
          },
        },
      ],
      test: true,
      trialDays: subsData?.trialDays,
    };
    const query = subscriptionCreate();
    const appSubscription = await queryDataWithVariables(res, query, variables);
    if (appSubscription?.errors) {
      return res.status(400).json({
        errors: appSubscription.errors,
      });
    } else if (
      appSubscription?.data?.appSubscriptionCreate?.userErrors?.[0]?.message
    ) {
      return res.status(400).json({
        errors: appSubscription.data?.appSubscriptionCreate?.userErrors?.[0],
      });
    }
    res.status(200).json({
      appSubscription: appSubscription.data?.appSubscriptionCreate,
      message: "Success",
    });
  } catch (error) {
    console.log("🚀 ~ createAppSubscription ~ error:", error);
    return res.status(400).json({
      error: error,
    });
  }
};

export const cancelAppSubscription = async (req, res, next) => {
  try {
    const subsData = req?.body?.priceId;

    let variables = {
      id: subsData,
    };
    const query = subscriptionCancel();
    const appSubscription = await queryDataWithVariables(res, query, variables);

    if (appSubscription?.errors) {
      return res.status(400).json({
        errors: appSubscription.errors,
      });
    } else if (
      appSubscription?.data?.appSubscriptionCancel?.userErrors?.[0]?.message
    ) {
      return res.status(400).json({
        errors: appSubscription?.data?.appSubscriptionCancel?.userErrors?.[0],
      });
    } else if (appSubscription?.response?.errors) {
      return res.status(400).json({
        errors: appSubscription?.response?.errors?.query,
      });
    }
    res.status(200).json({
      metafieldData:
        appSubscription?.data?.appSubscriptionCancel?.appSubscription,
      message: "Success",
    });
  } catch (error) {
    return res.status(400).json({
      error: error,
    });
  }
};
