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

export const GetItemHandles = `#graphql
query GetItemHandles{
  products(first:1) {
    edges {
      node {
        handle
      }
    }
  }
  collections(first: 1){
    edges {
      node {
				handle
      }
    }
  }
  articles(first: 1) {
    edges {
      node {
         handle
      }
    }
  }
}
`;
