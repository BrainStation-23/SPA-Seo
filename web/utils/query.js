export const subscriptionCreate = () => {
  return `mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean, $trialDays: Int ) {
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, test: $test, trialDays: $trialDays) {
        userErrors {
          field
          message
        }
        appSubscription {
          id
        }
        confirmationUrl
      }
    }`;
};

export const subscriptionCancel = () => {
  return `mutation AppSubscriptionCancel($id: ID!, $prorate: Boolean) {
        appSubscriptionCancel(id: $id, prorate: $prorate) {
          userErrors {
            field
            message
          }
          appSubscription {
            id
            status
          }
        }
      }`;
};

export const activeSubscription = () => {
  return `query getSubscription {
      appInstallation {
       activeSubscriptions {
        createdAt
        currentPeriodEnd
        id
        name
        status
        test
        trialDays
         lineItems {
          id
          plan {
            pricingDetails {
              __typename
              ... on AppRecurringPricing {
                interval
                price {
                  amount
                }
                discount {
                  value {
                    ... on AppSubscriptionDiscountAmount {
                      amount {
                        amount
                      }
                    }
                    ... on AppSubscriptionDiscountPercentage {
                      percentage
                    }
                  }
                  priceAfterDiscount {
                    amount
                  }
                }
              }
              ... on AppUsagePricing {
                interval
                cappedAmount {
                  amount
                }
                balanceUsed {
                  amount
                }
              }
            }
          }
          usageRecords(first: 250) {
            edges {
              node {
                id
                createdAt
                description
                idempotencyKey
                price {
                  amount
                }
              }
            }
          }
        }
      }
    }
   }
  `;
};
