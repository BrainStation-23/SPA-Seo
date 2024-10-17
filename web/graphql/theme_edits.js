export const themeFilesUpsert = `
mutation themeFilesUpsert($files: [OnlineStoreThemeFilesUpsertFileInput!]!, $themeId: ID!) {
  themeFilesUpsert(files: $files, themeId: $themeId) {
    job {
      # Job fields
    }
    upsertedThemeFiles {
      # OnlineStoreThemeFileOperationResult fields
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const GET_DEV_THEME_FILE_CONTENT = `
query GetDevTheme {
  themes(first: 1, roles: DEVELOPMENT) {
    edges {
      node {
        id
        files(
          first: 4
          filenames: ["sections/main-product.liquid", "sections/main-article.liquid", "sections/header.liquid", "sections/main-collection-product-grid.liquid"]
        ) {
          edges {
            node {
              filename
              size
              body {
                ... on OnlineStoreThemeFileBodyText {
                  content
                }
              }
              checksumMd5
              contentType
            }
          }
        }
      }
    }
  }
}
`;
