import shopify from "../shopify.js";

export async function initializeThemeFileContent({
  session,
  themeRole,
  assetKey,
  snippetKey,
  snippetCode,
}) {
  try {
    const themeList = await shopify.api.rest.Theme.all({
      session,
      fields: "id,name,role",
    });

    const mainTheme = themeList?.data?.find(
      (theme) => theme?.role === themeRole
    );

    const isPresent = await isSnippetsAvailable(
      session,
      mainTheme?.id,
      snippetKey
    );

    if (!isPresent) {
      const asset = new shopify.api.rest.Asset({
        session,
      });
      asset.theme_id = mainTheme?.id;
      asset.key = snippetKey;
      asset.value = snippetCode;
      await asset.save({
        update: true,
      });
    }

    if (assetKey) {
      const assetFile = await shopify.api.rest.Asset.all({
        session,
        theme_id: mainTheme?.id,
        asset: { key: assetKey },
      });

      return {
        assetFileContent: assetFile?.data?.[0]?.value,
        themeId: mainTheme?.id,
      };
    } else {
      return {
        themeId: mainTheme?.id,
        snippetKey,
      };
    }
  } catch (error) {
    console.log(error);
  }
}

async function isSnippetsAvailable(session, id, snippetKey) {
  try {
    await shopify.api.rest.Asset.all({
      session: session,
      theme_id: id,
      asset: { key: snippetKey },
    });
    return true;
  } catch (error) {
    return false;
  }
}
