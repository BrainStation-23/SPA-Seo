export const SubscribeToWebhook = `
mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
  webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
    userErrors {
      field
      message
    }
  }
}
`;

export const UnsubscribeFromWebhook = ``;

export const GetWebhookSubscriptions = `
query GetCleanupHooks{
  webhookSubscriptions(
    first: 1
    callbackUrl: "https://8a35-182-160-98-82.ngrok-free.app/api/cleanup"
  ) {
    edges {
      node {
        id
        topic
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
      }
    }
  }
}
`;
