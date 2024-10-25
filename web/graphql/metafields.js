const SHOP_NAME_SPACE = "bs-23-seo-app";
const JSONLD_META_FIELD_KEY = "json-ld";

export const GetShopId = `
    query GetShopId {
        shop {
            id
        }
    }`;

export const GetShopMetafield = ({ namespace, key }) => `
    query GetShopMetafield {
        shop {
            metafield(key: "${key}", namespace: "${namespace}") {
                id
                namespace
                key
                value
            }      
        }
    }`;

export const GetProductMetafield = (ownerId) => `
query GetProductMetafield {
  product(id: "${ownerId}") {
    title
    metafield(key: "${JSONLD_META_FIELD_KEY}", namespace: "${SHOP_NAME_SPACE}") {
      id
      namespace
      key
      value
    }
  }
}
`;

export const GetCollectionMetafield = (ownerId) => `
query GetCollectionMetafield {
  collection(id: "${ownerId}") {
    title
    metafield(key: "${JSONLD_META_FIELD_KEY}", namespace: "${SHOP_NAME_SPACE}") {
      id
      namespace
      key
      value
    }
  }
}
`;

export const GetArticleMetafield = (ownerId) => `
query GetArticleMetafield {
  article(id: "${ownerId}") {
    title
    metafield(key: "${JSONLD_META_FIELD_KEY}", namespace: "${SHOP_NAME_SPACE}") {
      id
      namespace
      key
      value
    }
  }
}
`;

export const CheckShopMetafieldDefinition = (type, namespace, key) => `
    query CheckShopMetafieldDefinition {
        metafieldDefinitions( 
            first: 1, 
            namespace: "${namespace}", 
            key: "${key}", 
            ownerType: ${type}
        ) {
            edges {
                node {
                    id
                    name
                    namespace
                    key
                }
            }
        }
    }`;

export const CreateShopMetafieldDefinition = (
  type,
  namespace,
  key,
  description
) => `
        mutation CreateShopMetafieldDefinition {
            metafieldDefinitionCreate(definition: {
                namespace: "${namespace}",
                key: "${key}",
                type: "json",
                name: "SEO app metafield",
                description: "${description}",
                ownerType: ${type}
            }) {
                createdDefinition {
                    id
                    name
                }
                userErrors {
                    field
                    message
                    code
                }
            }
        }`;

export const SetShopMetafield = `
mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
        id
        key
        namespace
        value
    }
    userErrors {
      field
      message
      code
    }
  }
}
`;
