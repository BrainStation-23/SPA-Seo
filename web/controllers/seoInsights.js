import shopify from "../shopify.js";
import SpeedInsights from "../models/speedInsights.js";

export const getSeoInsightsController = async (req, res, next) => {
  const { device = "desktop" } = req.query;
  const url = `https://${res.locals.shopify.session?.shop}`;

  if (!["desktop", "mobile"].includes(device)) {
    return res
      .status(400)
      .json({ error: 'Device must be "desktop" or "mobile"' });
  }

  try {
    const result = await fetchPageSpeedData(url, device);
    res.json(result);
  } catch (error) {
    console.error(
      "PageSpeed API Error:",
      error?.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch SEO score" });
  }
};

// Utility to fetch PageSpeed data
async function fetchPageSpeedData(url, strategy = "desktop") {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&key=${process.env.GOOGLE_API_KEY}&strategy=${strategy}`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  const lighthouse = data?.lighthouseResult;
  const audits = lighthouse?.audits;

  return {
    device: strategy,
    score: Math.round(lighthouse.categories.performance.score * 100),
    performance: {
      speedIndex: audits["speed-index"].displayValue,
      firstContentfulPaint: audits["first-contentful-paint"].displayValue,
      largestContentfulPaint: audits["largest-contentful-paint"].displayValue,
      cumulativeLayoutShift: audits["cumulative-layout-shift"].displayValue,
      totalBlockingTime: audits["total-blocking-time"].displayValue,
    },
  };
}

// UPDATE SpeedInsights by platformStoreURL
export const updateSpeedEffects = async (req, res) => {
  try {
    const platformStoreURL = res.locals.shopify.session?.shop;
    const updateData = req.body;

    if (!platformStoreURL) {
      return res
        .status(400)
        .json({ message: "platformStoreURL is required in params." });
    }

    const updated = await SpeedInsights.findOneAndUpdate(
      { platformStoreURL },
      { $set: updateData, $setOnInsert: { platformStoreURL } },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
