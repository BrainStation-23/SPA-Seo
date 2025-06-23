import puppeteer from "puppeteer";

const getAllPageUrls = (
  shopUrl,
  productHandle,
  collectionHandle,
  articleHandle
) => {
  // return [];
  return [
    // `${shopUrl}/collections`,
    `${shopUrl}/collections/${collectionHandle}`,
    // `${shopUrl}/collections/all`,
    `${shopUrl}/cart`,
    `${shopUrl}/products/${productHandle}`,
    // `${shopUrl}/blogs/news`,
    `${shopUrl}/blogs/food/${articleHandle}`,
    // `${shopUrl}/search?q=a&options%5Bprefix%5D=last`,
    // `${shopUrl}/pages/contact`,
  ];
};

const bypassPasswordPage = async (storePassword, page) => {
  try {
    console.log(
      "[CriticalCSS] Password page detected. Attempting to log in..."
    );
    if (!storePassword) {
      throw new Error(
        "Store is password protected, but no storefront password provided by the merchant."
      );
    }

    await page.type('form[action="/password"] input#password', storePassword);

    const submitButton = await page.$(
      'form[action="/password"] button[type="submit"]'
    );
    if (submitButton) {
      console.log(
        `[CriticalCSS] Clicking submit button with selector: ${'form[action="/password"] button[type="submit"]'}`
      );
      await submitButton.click();
    } else {
      console.warn(
        `[CriticalCSS] Submit button with selector '${'form[action="/password"] button[type="submit"]'}' not found. Trying Enter key.`
      );
      await page.keyboard.press("Enter");
    }

    await page.waitForNetworkIdle({
      timeout: 5 * 60000,
    });
    console.log(
      "[CriticalCSS] Waiting for the page to load after submitting the password..."
    );

    const currentUrl = page.url();
    if (currentUrl.includes("/password") || (await page.$("#password"))) {
      throw new Error(
        "Failed to bypass password protection with provided password. Please check the password or the theme's form selectors, or ensure the store is not permanently locked."
      );
    }
    console.log("[CriticalCSS] Successfully bypassed password protection.");
    // return page;
  } catch (error) {
    console.error("Error bypassing password page:", error);
    throw new Error(`Error bypassing password page: ${error.message}`);
  }
};

export const startPuppeteer = async (
  storefrontPassword,
  urlToCrawl,
  handles,
  viewport
) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--disable-features=site-per-process",
      ],
    });
    const page = await browser.newPage();
    await page.setViewport(viewport);
    console.log(
      `[CriticalCSS] Navigating to ${urlToCrawl} for critical CSS generation (Viewport: ${viewport.width}x${viewport.height})...`
    );

    await page.goto(urlToCrawl, {
      waitUntil: "networkidle0",
      timeout: 5 * 60000,
    });

    const passwordInputField = await page.$("#password");
    if (passwordInputField) {
      await bypassPasswordPage(storefrontPassword, page);
      console.log(`[CriticalCSS] Current page ${page.url()}.`);
    }

    const htmlContents = [];
    const htmlForHomePage = await page.content();
    htmlContents.push({
      url: urlToCrawl,
      html: htmlForHomePage,
    });

    const urlsToCrawl = getAllPageUrls(
      urlToCrawl,
      handles.productHandle,
      handles.collectionHandle,
      handles.articleHandle
    );
    for (let i = 0; i < urlsToCrawl.length; i++) {
      const url = urlsToCrawl[i];
      try {
        console.log(`[CriticalCSS] Crawling URL: ${url}`);
        await page.goto(url, {
          waitUntil: "networkidle0",
          timeout: 5 * 60000,
        });
        const htmlContent = await page.content();
        htmlContents.push({
          url,
          html: htmlContent,
        });
      } catch (error) {
        console.log(`[CriticalCSS] Error while Crawling URL: ${url}`);
        console.error(`Error crawling URL ${url}:`, error);
      }
    }
    urlsToCrawl.forEach(async (url) => {
      try {
        console.log(`[CriticalCSS] Crawling URL: ${url}`);
        await page.goto(url, {
          waitUntil: "networkidle0",
          timeout: 5 * 60000,
        });

        const htmlContent = await page.content();
        htmlContents.push({
          url,
          html: htmlContent,
        });
      } catch (error) {
        console.error(`Error crawling URL ${url}:`, error);
      }
    });

    return htmlContents;
  } catch (error) {
    console.error("Error initiating Puppeteer:", error);
    throw new Error(`Error initiating Puppeteer: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
