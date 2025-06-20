export const getShopDetails = `#graphql
query GetShopDetails {
  shop {
    name
    url
    myshopifyDomain
    primaryDomain {
      id
      host
      url
    }
  }
}
`;
