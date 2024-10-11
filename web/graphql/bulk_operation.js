export const createStagedUploadMutation = `
mutation CreateStagedUploadUrl {
  stagedUploadsCreate(input: {
    resource: BULK_MUTATION_VARIABLES,
    filename: "products_update.jsonl",
    mimeType: "text/jsonl",
    httpMethod: POST
  }) {
    stagedTargets {
      url
      resourceUrl
      parameters {
        name
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const bulkOperationMutaion = `
mutation BulkUpdate($uploadPath: String!){
  bulkOperationRunMutation(
    mutation: """
      mutation FileUpdate($input: [FileUpdateInput!]!) {
        fileUpdate(files: $input) {
          userErrors {
            code
            field
            message
          }
          files {
            alt
          }
        }
      }
    """
    stagedUploadPath: $uploadPath
  ) {
    bulkOperation {
      id
      status
    }
    userErrors {
      message
      field
    }
  }
}
`;

export const FileUpdate = `
mutation FileUpdate($input: [FileUpdateInput!]!) {
  fileUpdate(files: $input) {
    userErrors {
      code
      field
      message
    }
    files {
      alt
    }
  }
}
`;

export const UpdateCollectiob = `
mutation updateCollectionRules($input: CollectionInput!) {
  collectionUpdate(input: $input) {
    userErrors {
      field
      message
    }
  }
}
`;

export const UpdateArticle = `
mutation articleUpdate($article: ArticleUpdateInput!, $id: ID!) {
  articleUpdate(article: $article, id: $id) {
    userErrors {
      field
      message
    }
  }
}
`;
