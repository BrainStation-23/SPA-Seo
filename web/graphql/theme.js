export const GetThemeFile = `#graphql
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

export const UpdateThemeFiles = `#graphql
mutation UpdateThemeFiles($files: [OnlineStoreThemeFilesUpsertFileInput!]!, $themeId: ID!) {
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
}`;

export const GetAllThemeFiles = `#graphql
query GetAllThemeFiles($count: Int!, $after: String) {
  themes(first: 1, roles: MAIN) {
    edges {
      node {
        id
        files(first: $count, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
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


