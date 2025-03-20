export async function fetchAllCollectionQuery() {
  return `
  query ($collectionIds: String) {
    collections(first: 250, query: $collectionIds) {
      edges {
        node {
          id
          title
          description
          handle
        }
      }
    }
  }
`;
}
