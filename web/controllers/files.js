import shopify from "../shopify.js";

const filesQuery = (variables) => {
  let query = `#graphql
  query GetFiles($count: Int!, $cursor: String) {
    files(first: $count, after: $cursor, query:"media_type:image") {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          id
          __typename
          ... on MediaImage {
            originalSource {
              url
              fileSize
            }
            mimeType
            image {
              url
            }
          }
        }
      }
    }
  }`;
  if (variables?.before) {
    query = query.replace("first:", "last:");
    query = query.replace("after:", "before:");
  }
  return query;
};

const fetchAllFiles = async (session, variables) => {
  const client = new shopify.api.clients.Graphql({
    session: session,
  });

  try {
    const query = filesQuery(variables);
    const response = await client.request(query, { variables });

    // const collectionsCount = response.data.collectionsCount;
    const files = response.data.files.edges;
    const pageInfo = response.data.files.pageInfo;
    return { files, pageInfo };
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
};

export const filesController = async (req, res, next) => {
  try {
    const afterCursor = req?.query?.afterCursor;
    const beforeCursor = req?.query?.beforeCursor;
    const limit = req?.query?.limit;

    let variables = {
      count: +limit,
      cursor: afterCursor || beforeCursor || null,
      after: afterCursor || null,
      before: beforeCursor || null,
    };

    const files = await fetchAllFiles(res.locals.shopify.session, variables);

    return res.status(200).json(files);
  } catch (err) {
    console.log(
      "🚀 ~ file: description.js:73 ~ descriptionController ~ err:",
      err
    );
    res.status(400).json({ err });
  }
};
