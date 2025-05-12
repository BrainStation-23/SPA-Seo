import React, { useState, useCallback, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Box,
  Text,
  Divider,
  List,
  BlockStack,
  Form,
  FormLayout,
  TextField,
  Button,
  InlineStack,
  Banner,
} from "@shopify/polaris";
import { RefreshIcon } from "@shopify/polaris-icons";
import { useImageOptimizerQuery } from "../hooks/useImageOptimizer";
import { useBulkImageFilenameUpdate } from "../hooks/useImageOptimizer";
import { Spinners } from "./Spinner";
import { validateFilename } from "../utils/validFileName";

export function BulkProductImageFilename() {
  const [errors, setErrors] = useState("");
  const {
    data,
    isSuccess: isFetchSuccess,
    isLoading: isFetchLoading,
  } = useImageOptimizerQuery({
    url: "/api/metafields/get/image-optimizer",
  });

  const {
    mutate: bulkUpdate,
    isLoading,
    isSuccess,
    isError,
  } = useBulkImageFilenameUpdate();

  const [filename, setFilename] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);

  const handleProductImageAltChange = useCallback((value) => {
    setFilename(value);
    setErrors("");
  }, []);

  const handleSubmit = () => {
    const validationError = validateFilename(filename);
    if (validationError) {
      setErrors(validationError);
      return;
    }

    bulkUpdate({ fileNameSettings: filename });
  };

  useEffect(() => {
    if (isFetchSuccess) {
      setFilename(data?.data?.filename);
    }
  }, [isFetchSuccess, isFetchLoading]);

  useEffect(() => {
    if (isLoading) setIsWaiting(true);
    if (isSuccess) {
      setTimeout(() => {
        setIsWaiting(false);
      }, 3000);
    } else if (isError) {
      setTimeout(() => {
        setIsWaiting(false);
      }, 5000);
    }
  }, [isSuccess, isError, isLoading]);

  return (
    <>
      {isFetchLoading ? (
        <Spinners />
      ) : (
        <Page
          fullWidth
          title="Product Image Filename Optimization"
          subtitle="Filename optimization for better SEO"
          primaryAction={
            <InlineStack gap={"2"}>
              <Button
                primary
                icon={RefreshIcon}
                loading={isLoading || isWaiting}
                onClick={handleSubmit}
              >
                Sync
              </Button>
            </InlineStack>
          }
        >
          <Box paddingBlockStart={"2"}>
            <Layout>
              <Layout.Section>
                <Form onSubmit={handleSubmit}>
                  <BlockStack gap={"4"}>
                    <Box>
                      <Layout>
                        <Layout.Section oneThird>
                          <BlockStack>
                            <Text variant="headingMd">
                              Product image filename
                            </Text>
                            <Text variant="bodyMd">
                              Set up a global structure for product image
                              filenames for better SEO.
                            </Text>
                          </BlockStack>
                        </Layout.Section>
                        <Layout.Section>
                          <Box>
                            <Card>
                              <FormLayout>
                                <TextField
                                  value={filename}
                                  onChange={handleProductImageAltChange}
                                  label={
                                    <Text variant="headingSm">File name</Text>
                                  }
                                  placeholder="Enter filename or use variables."
                                  helpText="Can use variables from the PRODUCT and SHOP section"
                                  type="text"
                                  error={errors}
                                />
                              </FormLayout>
                            </Card>
                          </Box>

                          <Box paddingBlockStart={"3"}>
                            <Banner
                              title="Filename Guidelines"
                              status="warning"
                            >
                              <List>
                                <List.Item>
                                  Keep your filename relevant to the actual
                                  content .
                                </List.Item>
                                <List.Item>
                                  Avoid keyword stuffing in filenames; use a
                                  concise, descriptive name instead.
                                </List.Item>
                                <List.Item>
                                  Keep filenames short—ideally 5 words or fewer.
                                </List.Item>
                                <List.Item>
                                  Separate words with hyphens (e.g.,
                                  "apple-food.jpg").
                                </List.Item>
                                <List.Item>
                                  Avoid using generic names like "IMG1234.jpg"
                                  or overly keyword names like
                                  "Best-food-planner.jpg."
                                </List.Item>
                              </List>
                            </Banner>
                          </Box>
                        </Layout.Section>
                      </Layout>
                    </Box>
                  </BlockStack>
                </Form>
              </Layout.Section>
              <Layout.Section oneThird>
                <BlockStack gap={"4"}>
                  <Card>
                    <Text variant="bodyMd">
                      Use custom text and variables to create alt text templates
                      for images. Your custom text works as a static template,
                      while the variables pull in dynamic values from your
                      store's content.
                    </Text>
                    <Box paddingBlockStart={"3"}>
                      <Text variant="bodyMd" fontWeight="bold">
                        Use the following variables exactly as listed, including
                        whitespace, to set image filename.
                      </Text>
                    </Box>
                  </Card>
                  <Card padding={"0"}>
                    <Box padding={"5"}>
                      <Text variant="headingLg">Variables</Text>
                    </Box>
                    <Divider borderWidth="2" />
                    <Box padding={"5"}>
                      <Box paddingBlockEnd={"1"}>
                        <Text variant="headingSm">PRODUCT</Text>
                      </Box>
                      <List type="bullet">
                        <List.Item>
                          <Text variant="headingSm">{`{{ product.title }}`}</Text>
                        </List.Item>
                        <List.Item>
                          <Text variant="headingSm">{`{{ product.type }}`}</Text>
                        </List.Item>
                        <List.Item>
                          <Text variant="headingSm">{`{{ product.vendor }}`}</Text>
                        </List.Item>
                        <List.Item>
                          <Text variant="headingSm">{`{{ product.tags }}`}</Text>
                        </List.Item>
                      </List>
                    </Box>
                    <Divider borderWidth="2" />
                    <Box padding={"5"}>
                      <Box paddingBlockEnd={"1"}>
                        <Text variant="headingSm">SHOP</Text>
                      </Box>
                      <List type="bullet">
                        <List.Item>
                          <Text variant="headingSm">{`{{ shop.name }}`}</Text>
                        </List.Item>
                        <List.Item>
                          <Text variant="headingSm">{`{{ shop.domain }}`}</Text>
                        </List.Item>
                      </List>
                    </Box>
                  </Card>
                </BlockStack>
              </Layout.Section>
            </Layout>
          </Box>
        </Page>
      )}
    </>
  );
}
