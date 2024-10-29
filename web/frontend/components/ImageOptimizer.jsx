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
import Switch from "./commonUI/Switch/Switch";
import { Spinners } from "./Spinner";
import {
  useImageOptimizerQuery,
  useSaveImageOptimizerSettings,
  useBulkUpdateAltText,
} from "../hooks/useImageOptimizer";

export function ImageAltOptimizer() {
  const { data, isSuccess, isLoading } = useImageOptimizerQuery({
    url: "/api/metafields/get/image-optimizer",
  });

  const {
    mutate: saveImageOptimizerSettings,
    isLoading: isSavingImageOptimizerSettings,
    isSuccess: isSuccessSavingImageOptimizerSettings,
  } = useSaveImageOptimizerSettings();
  const { mutate: runBulkImageUpdate, isLoading: isBulkAltUpdating } =
    useBulkUpdateAltText();

  const [productImageAlt, setProductImageAlt] = useState(null);
  const [collectionImgeAlt, setCollectionImageAlt] = useState(null);
  const [articleImageAlt, setArticleImageAlt] = useState(null);
  const [productAltStatus, setProductAltStatus] = useState(false);
  const [collectionAltStatus, setCollectionAltStatus] = useState(false);
  const [articleAltStatus, setArticleAltStatus] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const metadata = data.data;
      setProductImageAlt(metadata?.altText?.product || null);
      setCollectionImageAlt(metadata?.altText?.collection || null);
      setArticleImageAlt(metadata?.altText?.article || null);
      setProductAltStatus(metadata?.altText?.productStatus || false);
      setCollectionAltStatus(metadata?.altText?.collectionStatus || false);
      setArticleAltStatus(metadata?.altText?.articleStatus || false);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isSuccessSavingImageOptimizerSettings) {
      setIsChanged(false);
    }
  }, [isSuccessSavingImageOptimizerSettings]);

  const handleParoductAltStatusChange = () => {
    setProductAltStatus((prev) => !prev);
    setIsChanged(true);
  };
  const handleCollectionAltStatusChange = () => {
    setCollectionAltStatus((prev) => !prev);
    setIsChanged(true);
  };
  const handleArticleAltStatusChange = () => {
    setArticleAltStatus((prev) => !prev);
    setIsChanged(true);
  };

  const handleProductImageAltChange = useCallback((value) => {
    setProductImageAlt(value);
    setIsChanged(true);
  }, []);
  const handleCollectionImageAltChange = useCallback((value) => {
    setCollectionImageAlt(value);
    setIsChanged(true);
  }, []);
  const handleArticleImageAltChange = useCallback((value) => {
    setArticleImageAlt(value);
    setIsChanged(true);
  }, []);

  const handleSubmit = () => {
    saveImageOptimizerSettings({
      type: "altText",
      data: {
        product: productImageAlt,
        productStatus: productAltStatus,
        collection: collectionImgeAlt,
        collectionStatus: collectionAltStatus,
        article: articleImageAlt,
        articleStatus: articleAltStatus,
      },
    });
  };

  return (
    <>
      {isLoading ? (
        <Spinners />
      ) : (
        <Page
          fullWidth
          title="Image Alt Optimization"
          subtitle="Alt tags helps you improve accessibility, relevance between images and content, and increase the ability to rank high in Google Images."
          primaryAction={
            <HorizontalStack gap={"2"}>
              <Button
                plain
                onClick={() => {
                  setProductImageAlt("{{ product.title }} {{ shop.name }}");
                  setArticleImageAlt("{{ product.title }} {{ shop.name }}");
                  setCollectionImageAlt(
                    "{{ collection.title }} {{ shop.name }}"
                  );
                  setIsChanged(true);
                }}
              >
                Restore default
              </Button>
              <Button
                primary
                disabled={!isChanged}
                loading={isSavingImageOptimizerSettings}
                onClick={handleSubmit}
              >
                Save settings
              </Button>
              <Button
                primary
                icon={RefreshIcon}
                disabled={isChanged}
                loading={isBulkAltUpdating}
                onClick={runBulkImageUpdate}
              >
                Sync Alt Text
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
                            <Text variant="headingMd">Product Image Alt</Text>
                            <Text variant="bodyMd">
                              Can use variables in the PRODUCT and SHOP section
                            </Text>
                            <Box paddingBlockStart={"4"}>
                              <Switch
                                checked={productAltStatus}
                                handleClick={handleParoductAltStatusChange}
                              />
                            </Box>
                          </VerticalStack>
                        </Layout.Section>
                        <Layout.Section>
                          <Box>
                            <AlphaCard>
                              <FormLayout>
                                <TextField
                                  value={productImageAlt}
                                  onChange={handleProductImageAltChange}
                                  label={
                                    <Text variant="headingSm">Alt Text</Text>
                                  }
                                  placeholder="Enter alt text or use variables. For example: {{ product.title }} {{ shop.name }}"
                                  helpText="Can use variables in the PRODUCT and SHOP section"
                                  type="text"
                                />
                              </FormLayout>
                            </AlphaCard>
                          </Box>
                        </Layout.Section>
                      </Layout>
                    </Box>
                    <Divider borderWidth="1" />
                    <Box>
                      <Layout>
                        <Layout.Section oneThird>
                          <VerticalStack>
                            <Text variant="headingMd">
                              Collection Image Alt
                            </Text>
                            <Text variant="bodyMd">
                              Can use variables in the COLLECTION and SHOP
                              section
                            </Text>
                            <Box paddingBlockStart={"4"}>
                              <Switch
                                checked={collectionAltStatus}
                                handleClick={handleCollectionAltStatusChange}
                              />
                            </Box>
                          </VerticalStack>
                        </Layout.Section>
                        <Layout.Section>
                          <Box>
                            <AlphaCard>
                              <FormLayout>
                                <TextField
                                  value={collectionImgeAlt}
                                  onChange={handleCollectionImageAltChange}
                                  label={
                                    <Text variant="headingSm">Alt Text</Text>
                                  }
                                  placeholder="Enter alt text or use variables. For example: {{ collection.title }} {{ shop.name }}"
                                  helpText="Can use variables in the COLLECTION and SHOP section"
                                  type="text"
                                />
                              </FormLayout>
                            </AlphaCard>
                          </Box>
                        </Layout.Section>
                      </Layout>
                    </Box>
                    <Divider borderWidth="1" />
                    <Box>
                      <Layout>
                        <Layout.Section oneThird>
                          <VerticalStack>
                            <Text variant="headingMd">Blog Post Image Alt</Text>
                            <Text variant="bodyMd">
                              Can use variables in the BLOG POST and SHOP
                              section
                            </Text>
                            <Box paddingBlockStart={"4"}>
                              <Switch
                                checked={articleAltStatus}
                                handleClick={handleArticleAltStatusChange}
                              />
                            </Box>
                          </VerticalStack>
                        </Layout.Section>
                        <Layout.Section>
                          <Box>
                            <AlphaCard>
                              <FormLayout>
                                <TextField
                                  value={articleImageAlt}
                                  onChange={handleArticleImageAltChange}
                                  label={
                                    <Text variant="headingSm">Alt Text</Text>
                                  }
                                  placeholder="Enter alt text or use variables. For example: {{ article.title }} {{ shop.name }}"
                                  helpText="Can use variables in the BLOG POST and SHOP section"
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
                        whitespace, to set image alt text.
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
                        <Text variant="headingSm">COLLECTION</Text>
                      </Box>
                      <List type="bullet">
                        <List.Item>
                          <Text variant="headingSm">{`{{ collection.title }}`}</Text>
                        </List.Item>
                      </List>
                    </Box>
                    <Divider borderWidth="2" />
                    <Box padding={"5"}>
                      <Box paddingBlockEnd={"1"}>
                        <Text variant="headingSm">BLOG POST</Text>
                      </Box>
                      <List type="bullet">
                        <List.Item>
                          <Text variant="headingSm">{`{{ article.title }}`}</Text>
                        </List.Item>
                        <List.Item>
                          <Text variant="headingSm">{`{{ article.author }}`}</Text>
                        </List.Item>
                        <List.Item>
                          <Text variant="headingSm">{`{{ article.tags }}`}</Text>
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
