import React from "react";
import {
  Card,
  Layout,
  Text,
  BlockStack,
  Grid,
  Button,
  InlineStack,
} from "@shopify/polaris";
import useFetchQuery from "../hooks/useGlobalQuery";
import { pricingPlan } from "../utils/pricingPlan.js";
import useCreate from "../hooks/useGlobalMutation";
import useCancelBilling from "../hooks/useGlobalMutation";
import { formatReadableDates } from "../utils/dateConvert.js";
import { Spinners } from "./Spinner";

export default function Billing() {
  const { isLoading, data } = useFetchQuery({
    apiEndpoint: "/api/billing/get-store-info",
    apiKey: "getActiveSubscription",
    dependency: [],
  });

  const {
    mutate: createSubscription,
    isError: isErrorForBulk,
    isLoading: isCreateLoading,
  } = useCreate("/api/billing/app-billing-create", "activeSubscription");

  const { mutate: cancelSubscription, isLoading: isCancelLoading } =
    useCancelBilling("/api/billing/app-billing-cancel", "activeSubscription");

  const handleSubmit = async (data) => {
    createSubscription(data, {
      onSuccess: async (res) => {
        const response = await res?.json();
        window.top.location.href = response?.appSubscription?.confirmationUrl;
      },
      onError: (error) => {
        alert("Billing failed: " + error.message);
      },
    });
  };

  return (
    <Card>
      <BlockStack gap="500">
        <Card>
          <Text variant="heading2xl" as="h3">
            Subscription plan
          </Text>
        </Card>
        <Layout>
          <Layout.Section secondary>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Your Current Plan
                </Text>
                {data?.activeSubscription?.status === "ACTIVE" ? (
                  <Grid>
                    <Grid.Cell
                      columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}
                    >
                      <Card>
                        <BlockStack gap="200">
                          <Text as="h6" variant="headingXs">
                            Name: {data?.activeSubscription?.name}
                          </Text>
                          <Text as="p" variant="bodyMd">
                            Activated On:{" "}
                            {formatReadableDates(
                              data?.activeSubscription?.createdAt
                            )}
                          </Text>
                          <Text as="p" variant="bodyMd">
                            Expiration date:{" "}
                            {formatReadableDates(
                              data?.activeSubscription?.currentPeriodEnd
                            )}
                          </Text>{" "}
                          <Text>
                            <Button
                              onClick={() =>
                                cancelSubscription({
                                  priceId: data?.activeSubscription?.id,
                                })
                              }
                              variant="primary"
                              tone="critical"
                            >
                              {isCancelLoading ? <Spinners /> : "Cancel"}
                            </Button>
                          </Text>
                        </BlockStack>
                      </Card>
                    </Grid.Cell>
                    <Grid.Cell
                      columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}
                    >
                      <Card>
                        <BlockStack gap="200">
                          <Text variant="headingLg" as="h5">
                            Features
                          </Text>
                          <BlockStack gap="200">
                            {pricingPlan.map((item) =>
                              item.name === data?.activeSubscription?.name ? (
                                item?.feature.map((itm) => <Text>{itm}</Text>)
                              ) : (
                                <></>
                              )
                            )}
                          </BlockStack>
                        </BlockStack>
                      </Card>
                    </Grid.Cell>
                  </Grid>
                ) : (
                  <Text as="h6" variant="headingXs">
                    Name: Free Plan
                  </Text>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Select your plan
                </Text>
                <Grid>
                  {pricingPlan.map((item) => (
                    <Grid.Cell
                      columnSpan={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 4 }}
                    >
                      <Card sectioned>
                        <Text variant="headingLg" as="h5" alignment="left">
                          {item?.name}
                        </Text>
                        <BlockStack gap="200" align="center">
                          <Text as="h2" variant="headingMd" alignment="center">
                            ${item?.amount}
                            <Text as="p" variant="bodyMd" alignment="center">
                              Free trial {item?.trialDays} days
                            </Text>
                            <Text as="p" variant="bodyMd" alignment="center">
                              {item?.interval === "EVERY_30_DAYS"
                                ? "After Every 30 Days"
                                : item?.interval}
                            </Text>
                          </Text>
                          {item?.feature.map((item) => (
                            <Text as="p" variant="bodyMd" alignment="center">
                              {item}
                            </Text>
                          ))}
                          <Button
                            variant="primary"
                            textAlign="center"
                            onClick={() => handleSubmit(item)}
                            disabled={
                              item?.name == "Free" ||
                              data?.activeSubscription?.status === "ACTIVE"
                            }
                          >
                            {item?.buttonTitle}
                          </Button>
                        </BlockStack>
                      </Card>
                    </Grid.Cell>
                  ))}
                </Grid>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Card>
  );
}
