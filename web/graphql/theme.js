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

// Get specific theme file
export const GET_THEME_FILE = `#graphql
query GetThemeFile($count: Int!, $role: ThemeRole!, $filename: String!) {
  themes(first: $count, roles: [$role]) {
    edges {
      node {
        id
        files(filenames: [$filename]) {
          edges {
            node {
              filename
              size
              createdAt
              updatedAt
              checksumMd5
              contentType
              body {
                ... on OnlineStoreThemeFileBodyText {
                  content
                }
              }
            }
          }
        }
      }
    }
  }
}`;


