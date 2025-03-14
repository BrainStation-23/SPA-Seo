// const listOfProducts = `query MyQuery {
//   products(first: 20, query: "(id:8042415816983) OR (id:8105484845335)") {
//     edges {
//       node {
//         title
//         id
//       }
//     }
//   }
// }`

export async function fetchAllProductsQuery() {
  return `query ($productIds: String) {
    products(first: 250, query: $productIds) {
      edges {
      node {
        title
        id
        description
        tags
      }
      }
      }
    }`;
}
