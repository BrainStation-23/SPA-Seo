export function createArticle() {
  return `mutation CreateArticle($article: ArticleCreateInput!) {
      articleCreate(article: $article) {
        article {
          id
          title
          author {
            name
          }
          handle
          body
          summary
          tags
          image {
            altText
            originalSrc
          }
        }
        userErrors {
          code
          field
          message
        }
      }
    }`;
}

export const uploadFileQuery = () => {
  return `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
      }
    }`;
};

export const fileCreateQuery = () => {
  return `mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          fileStatus
          alt
          createdAt
          preview {
            image {
              altText
              url
            }
          }
        }
      }
    }`;
};
