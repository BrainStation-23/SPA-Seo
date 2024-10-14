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
import { SaveIcon, RefreshIcon, ImageAltIcon } from "@shopify/polaris-icons";
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
  } = useSaveImageOptimizerSettings();
  const { mutate: runBulkImageUpdate, isLoading: isBulkAltUpdating } =
    useBulkUpdateAltText();

  const [productImageAlt, setProductImageAlt] = useState(
    "{{ product.title }} {{ shop.name }}"
  );
  const [collectionImgeAlt, setCollectionImageAlt] = useState(
    "{{ collection.title }} {{ shop.name }}"
  );
  const [articleImageAlt, setArticleImageAlt] = useState(
    "{{ article.title }} {{ shop.name }}"
  );
  const [productAltStatus, setProductAltStatus] = useState(false);
  const [collectionAltStatus, setCollectionAltStatus] = useState(false);
  const [articleAltStatus, setArticleAltStatus] = useState(false);
  const [lazyLoadImages, setLazyLoadImages] = useState(true);

  useEffect(() => {
    if (isSuccess) {
      const metadata = data.data;
      setProductImageAlt(
        metadata?.altText?.product || "{{ product.title }} {{ shop.name }}"
      );
      setCollectionImageAlt(
        metadata?.altText?.collection ||
          "{{ collection.title }} {{ shop.name }}"
      );
      setArticleImageAlt(
        metadata?.altText?.article || "{{ article.title }} {{ shop.name }}"
      );
      setProductAltStatus(metadata?.altText?.productStatus || false);
      setCollectionAltStatus(metadata?.altText?.collectionStatus || false);
      setArticleAltStatus(metadata?.altText?.articleStatus || false);
      setLazyLoadImages(metadata?.altText?.lazyLoadImages || true);
    }
  }, [isSuccess]);

  const handleParoductAltStatusChange = () => {
    setProductAltStatus((prev) => !prev);
  };
  const handleCollectionAltStatusChange = () => {
    setCollectionAltStatus((prev) => !prev);
  };
  const handleArticleAltStatusChange = () => {
    setArticleAltStatus((prev) => !prev);
  };
  const handleLazyLoadImagesChange = () => setLazyLoadImages((prev) => !prev);

  const handleProductImageAltChange = useCallback((value) => {
    setProductImageAlt(value);
  }, []);
  const handleCollectionImageAltChange = useCallback((value) => {
    setCollectionImageAlt(value);
  }, []);
  const handleArticleImageAltChange = useCallback((value) => {
    setArticleImageAlt(value);
  }, []);

  const handleSubmit = () => {
    saveImageOptimizerSettings({
      type: "altText",
      data: {
        lazyLoadImages,
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
                  setArticleImageAlt("{{ article.title }} {{ shop.name }}");
                  setCollectionImageAlt(
                    "{{ collection.title }} {{ shop.name }}"
                  );
                }}
              >
                Restore default
              </Button>
              <Button
                primary
                loading={isSavingImageOptimizerSettings}
                onClick={handleSubmit}
              >
                Save settings
              </Button>
              <Button
                primary
                icon={RefreshIcon}
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
                                  placeholder="{{ product.title }} {{ shop.name }}"
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
                                  placeholder="{{ collection.title }} {{ shop.name }}"
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
                                  placeholder="{{ article.title }} {{ shop.name }}"
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
                      You can use the following variables in the image alt and
                      filename fields to dynamically generate the content based
                      on the product, collection, blog post, and shop
                      information.
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
