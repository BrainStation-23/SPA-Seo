export const GetThemeFilesPaginated = `#graphql
query GetThemeFilesPaginated($count: Int!, $role: ThemeRole!, $filename: String!, $after: String) {
  shop {
    id
    url
  }
  themes(first: 1, roles: [$role]) {
    edges {
      node {
        id
        files(filenames: [$filename], first: $count, after: $after) {
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
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
}`;

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
