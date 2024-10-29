import React, { useState, useCallback, useEffect } from "react";
import {
  Page,
  Layout,
  AlphaCard,
  Box,
  Text,
  Divider,
  List,
  VerticalStack,
  Form,
  FormLayout,
  TextField,
  Button,
  HorizontalStack,
} from "@shopify/polaris";
import { RefreshIcon } from "@shopify/polaris-icons";
import { useImageOptimizerQuery } from "../hooks/useImageOptimizer";
import { useBulkImageFilenameUpdate } from "../hooks/useImageOptimizer";
import { Spinners } from "./Spinner";

export function BulkProductImageFilename() {
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
  }, []);

  const handleSubmit = () => {
    if (filename === null || filename.length === 0) {
      return setToggleToast({
        active: true,
        message: `Filename cannot be empty`,
      });
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
            <HorizontalStack gap={"2"}>
              <Button
                primary
                icon={RefreshIcon}
                loading={isLoading || isWaiting}
                onClick={handleSubmit}
              >
                Sync
              </Button>
            </HorizontalStack>
          }
        >
          <Box paddingBlockStart={"2"}>
            <Layout>
              <Layout.Section>
                <Form onSubmit={handleSubmit}>
                  <VerticalStack gap={"4"}>
                    <Box>
                      <Layout>
                        <Layout.Section oneThird>
                          <VerticalStack>
                            <Text variant="headingMd">
                              Product image filename
                            </Text>
                            <Text variant="bodyMd">
                              Set up a global structure for product image
                              filenames for better SEO.
                            </Text>
                          </VerticalStack>
                        </Layout.Section>
                        <Layout.Section>
                          <Box>
                            <AlphaCard>
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
                                />
                              </FormLayout>
                            </AlphaCard>
                          </Box>
                        </Layout.Section>
                      </Layout>
                    </Box>
                  </VerticalStack>
                </Form>
              </Layout.Section>
              <Layout.Section oneThird>
                <VerticalStack gap={"4"}>
                  <AlphaCard>
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
                  </AlphaCard>
                  <AlphaCard padding={"0"}>
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
                  </AlphaCard>
                </VerticalStack>
              </Layout.Section>
            </Layout>
          </Box>
        </Page>
      )}
    </>
  );
}
