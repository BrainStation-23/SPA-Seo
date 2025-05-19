import puppeteer from "puppeteer";
import { PurgeCSS } from "purgecss";

import { GetThemeFilesPaginated } from "../graphql/theme.js";
import { queryDataWithVariables } from "../utils/getQueryData.js";

const getAllCssFilesForLiveTheme = async (res) => {
  const cssFiles = [],
    liquidFiles = [],
    jsFiles = [];
  let themeId = null,
    shopId = null,
    shopUrl = null,
    after = null,
    hasNextPage = true;

  while (hasNextPage) {
    const getThemeFileResponse = await queryDataWithVariables(
      res,
      GetThemeFilesPaginated,
      {
        count: 250,
        role: "MAIN",
        filename: "assets/*.css",
        after,
      }
    );
    const theme = getThemeFileResponse.data.themes.edges[0].node;
    themeId = getThemeFileResponse.data.themes.edges[0].node.id;
    shopId = getThemeFileResponse.data.shop.id;
    const pageInfo = theme.files.pageInfo;

    theme.files.edges.map(({ node }) => {
      if (node.filename.includes(".css"))
        cssFiles.push({ filename: node.filename, contnet: node.body.contnet });
      else if (node.filename.includes(".js"))
        jsFiles.push({ filename: node.filename, contnet: node.body.contnet });
      else if (node.filename.includes(".liquid"))
        liquidFiles.push({
          filename: node.filename,
          contnet: node.body.contnet,
        });
    });
    hasNextPage = pageInfo.hasNextPage;
    after = pageInfo?.after;
  }

  return { themeId, shopId, shopUrl, cssFiles, jsFiles, liquidFiles };
};

const bypassPasswordPage = async (page, password) => {
  console.log("Store is password-protected. Attempting login...");

  try {
    await page.type(
      'form[action="/password"] input[name="password"]',
      password
    );
    await Promise.all([
      page.$eval('form[action="/password"]', (form) => form.submit()),
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    ]);

    console.log("Login successful.");
  } catch (err) {
    console.error("Failed to bypass password page:", err);
  }
};

const getRenderedHTML = async (url) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const isPasswordPage = await page.$('form[action="/password"]');
    if (isPasswordPage) {
      await bypassPasswordPage(page, "bs23");
    }
    await page.waitForTimeout(2000);
    return await page.content();
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await browser.close();
  }
};

const createCSSImportMap = (liquidFiles, cssFiles) => {
  liquidFiles.forEach(({ filename, content }) => {});
};

export const removeUnusedCSS = async (res) => {
  try {
    const { cssFiles, themeId, shopId, shopUrl } =
      await getAllCssFilesForLiveTheme(res);
    const html = await getRenderedHTML(shopUrl);
  } catch (error) {
    throw error;
  }
};
