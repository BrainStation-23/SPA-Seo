import shopify from "../shopify.js";
import SpeedInsights from "../models/speedInsights.js";

export const getSeoInsightsController = async (req, res, next) => {
  try {
    const apikey = "AIzaSyAEu1z7QmLwZBGCvyoU6n3Nin8iTfqan-A";

    const shop = await shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
      fields: "id,name,myshopify_domain,domain",
    });

    const product = await shopify.api.rest.Product.all({
      session: res.locals.shopify.session,
      limit: 1,
      status: "active",
      fields: "id,handle,title",
    });

    const collection = await shopify.api.rest.CustomCollection.all({
      session: res.locals.shopify.session,
      fields: "id,title,handle",
      limit: 1,
    });

    const homeUrl = `https://${shop?.data?.[0]?.domain}`;
    const productURl = `${homeUrl}/product/${product?.data?.[0]?.handle}`;
    const collectionURl = `${homeUrl}/collection/${collection?.data?.[0]?.handle}`;

    // Run all requests in parallel
    const [homeResponse, productResponse, collectionResponse] =
      await Promise.all([
        fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
            homeUrl
          )}&category=SEO&key=${apikey}`
        ),
        fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
            productURl
          )}&category=SEO&key=${apikey}`
        ),
        fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
            collectionURl
          )}&category=SEO&key=${apikey}`
        ),
      ]);

    const homeResult = await homeResponse.json();
    const productResult = await productResponse.json();
    const collectionResult = await collectionResponse.json();

    const results = [
      {
        url: homeUrl,
        seoScore: homeResult?.lighthouseResult?.categories?.seo?.score * 100,
        page: "Home Page",
      },
      {
        url: productURl,
        seoScore: productResult?.lighthouseResult?.categories?.seo?.score * 100,
        page: "Product Page",
      },
      {
        url: collectionURl,
        seoScore:
          collectionResult?.lighthouseResult?.categories?.seo?.score * 100,
        page: "Collection Page",
      },
    ];

    return res.status(200).json(results);
  } catch (err) {
    console.log("🚀 ~ getSeoInsightsController ~ Error:", err);
    res.status(400).json({ error: err.message });
  }
};

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
