import { GetThemeFilesPaginated } from "../graphql/theme.js";
import { queryDataWithVariables } from "../utils/getQueryData.js";

const getAllCssFilesForLiveTheme = async (res) => {
  const files = [],
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
    const themeId = getThemeFileResponse.data.themes.edges[0].node.id;
    const pageInfo = theme.files.pageInfo;
  }
};

export const removeUnusedCSS = async (res) => {};
