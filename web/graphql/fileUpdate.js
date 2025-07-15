/**
 * variables: {
  "files": [
    {
      "id": "gid://shopify/MediaImage/33668260659434",
      "originalSource": "https://cdn.shopify.com/s/files/1/0670/5768/0618/files/product_39_image1.jpg?v=1748958596"
    }
  ]
}
*/

export const FileUpdate = `#graphql
mutation fileUpdate($files: [FileUpdateInput!]!) {
  fileUpdate(files: $files) {
    files {
      id
      alt
      fileStatus
    }
    userErrors {
      field
      message
      code
    }
  }
}`;
