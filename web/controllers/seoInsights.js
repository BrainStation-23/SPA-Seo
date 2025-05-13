import shopify from "../shopify.js";
import { GetThemeFile, UpdateThemeFiles } from "../graphql/theme.js";
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

export const toggleInstantPages = async (req, res, next) => {
  try {
    const addInstantPage = req.body.activate === "true";
    const checkInstantPagesScriptRegex =
      /<script\b[^>]*\bsrc=(['"])\/\/instant\.page\/[^'"]+\1[^>]*><\/script>/i;
    const instantPagesScript = `<script src="//instant.page/5.2.0" type="module" integrity="sha384-jnZyxPjiipYXnSU0ygqeac2q7CVYMbh84q0uHVRRxEtvFPiQYbXWUorga2aqZJ0z"></script>`;
    const client = new shopify.api.clients.Graphql({
      apiVersion: "2025-01",
      session: res.locals.shopify.session,
    });

    const getThemeFileResponse = await client.request(GetThemeFile, {
      variables: { count: 1, role: "MAIN", filename: "layout/theme.liquid" },
    });
    const themeId = getThemeFileResponse.data.themes.edges[0].node.id;
    const themeFileText =
      getThemeFileResponse.data.themes.edges[0].node.files.edges[0].node.body
        .content;

    const alreadyActivatedInstantPages =
      checkInstantPagesScriptRegex.test(themeFileText);

    let responseMessage = "Not applied anything";
    if (addInstantPage && !alreadyActivatedInstantPages) {
      const updatedThemeFile = themeFileText.replace(
        `</body>`,
        `${instantPagesScript} </body>`
      );
      await client.request(UpdateThemeFiles, {
        variables: {
          themeId,
          files: [
            {
              filename: "layout/theme.liquid",
              body: {
                type: "TEXT",
                value: updatedThemeFile,
              },
            },
          ],
        },
      });
      responseMessage = "added";
    }
    if (!addInstantPage && alreadyActivatedInstantPages) {
      const updatedThemeFile = themeFileText.replace(
        checkInstantPagesScriptRegex,
        ""
      );
      await client.request(UpdateThemeFiles, {
        variables: {
          themeId,
          files: [
            {
              filename: "layout/theme.liquid",
              body: {
                type: "TEXT",
                value: updatedThemeFile,
              },
            },
          ],
        },
      });
      responseMessage = "removed";
    }

    res.status(200).json(responseMessage);
  } catch (error) {
    throw error;
  }
};
