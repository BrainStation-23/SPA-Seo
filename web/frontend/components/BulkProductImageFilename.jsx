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
import { useBulkImageFilenameUpdate } from "../hooks/useImageOptimizer";
import { useUI } from "../contexts/ui.context";

export function BulkProductImageFilename() {
  const { setToggleToast } = useUI();
  const {
    mutate: bulkUpdate,
    isLoading,
    isSuccess,
    isError,
  } = useBulkImageFilenameUpdate();
  const [productImageFileName, setProductImageFileName] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);

  const handleProductImageAltChange = useCallback((value) => {
    setProductImageFileName(value);
  }, []);

  const handleSubmit = () => {
    if (productImageFileName === null || productImageFileName.length === 0) {
      return setToggleToast({
        active: true,
        message: `Filename cannot be empty`,
      });
    }
    bulkUpdate({ fileNameSettings: productImageFileName });
  };

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
    <Page
      fullWidth
      title="Product Image Filename Optimization"
      subtitle="Filename optimization for better SEO"
      primaryAction={
        <Button
          primary
          icon={RefreshIcon}
          loading={isLoading || isWaiting}
          onClick={handleSubmit}
        >
          Sync
        </Button>
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
                        <Text variant="headingMd">Product image filename</Text>
                        <Text variant="bodyMd">
                          Set up a global structure for product image filenames
                          for better SEO.
                        </Text>
                      </VerticalStack>
                    </Layout.Section>
                    <Layout.Section>
                      <Box>
                        <AlphaCard>
                          <FormLayout>
                            <TextField
                              value={productImageFileName}
                              onChange={handleProductImageAltChange}
                              label={<Text variant="headingSm">File name</Text>}
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
                  Use custom text and variables to create alt text templates for
                  images. Your custom text works as a static template, while the
                  variables pull in dynamic values from your store's content.
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
                  <Text variant="headingMd">Variables</Text>
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
  );
}
