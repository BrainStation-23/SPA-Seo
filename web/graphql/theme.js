// GraphQL queries for theme operations

// Get theme ID
export const GET_THEME_ID = `
  query GetThemeId {
    themes(first: 1, roles: MAIN) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

// Get theme files with pagination
export const GET_THEME_ALL_FILES = (themeId, cursor = null) => {
  const afterParam = cursor ? `, after: "${cursor}"` : "";
  return `
    query GetThemeFiles {
      theme(id: "${themeId}") {
        files(first: 100${afterParam}) {
          edges {
            cursor
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
          pageInfo {
            hasNextPage
          }
        }
      }
    }
  `;
};

// Edit theme files
export const EDIT_THEME_FILES = `
  mutation EditThemeFiles($files: [OnlineStoreThemeFilesUpsertFileInput!]!, $themeId: ID!) {
    themeFilesUpsert(files: $files, themeId: $themeId) {
      job {
        id
        done
      }
      upsertedThemeFiles {
        filename
      }
      userErrors {
        field
        message
      }
    }
  }
`;


