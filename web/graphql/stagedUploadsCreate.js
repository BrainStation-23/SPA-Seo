/**
 variables: {
  "input": [
    {
      "filename": "product-hero-image.jpg",
      "mimeType": "image/jpeg",
      "httpMethod": "POST",
      "resource": "PRODUCT_IMAGE"
    },
    {
      "filename": "product-demo.mp4",
      "mimeType": "video/mp4",
      "fileSize": "2048000",
      "resource": "VIDEO"
    },
    {
      "filename": "product-model.glb",
      "mimeType": "model/gltf-binary",
      "fileSize": "512000",
      "resource": "MODEL_3D"
    }
  ]
}
 */

export const StagedUploadCreate = `#graphql
mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
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
}`;
