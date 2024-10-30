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
import { Spinners } from "./Spinner";
import { useImageOptimizerQuery, useBulkUpdateAltText } from "../hooks/useImageOptimizer";

export function ImageAltOptimizer() {
  const [errors, setErrors] = useState({});
  const { data, isSuccess, isLoading } = useImageOptimizerQuery({
    url: "/api/metafields/get/image-optimizer",
  });
  const { mutate: runBulkImageUpdate, isLoading: isBulkAltUpdating } = useBulkUpdateAltText();

  const [productImageAlt, setProductImageAlt] = useState(null);
  const [collectionImgeAlt, setCollectionImageAlt] = useState(null);
  const [articleImageAlt, setArticleImageAlt] = useState(null);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const metadata = data.data;
      setProductImageAlt(metadata?.altText?.product || null);
      setCollectionImageAlt(metadata?.altText?.collection || null);
      setArticleImageAlt(metadata?.altText?.article || null);
    }
  }, [isSuccess]);

  const handleProductImageAltChange = useCallback((value) => {
    setProductImageAlt(value);
    setIsChanged(true);
    setErrors({ ...errors, productImageAlt: "" });
  }, []);
  const handleCollectionImageAltChange = useCallback((value) => {
    setCollectionImageAlt(value);
    setIsChanged(true);
    setErrors({ ...errors, collectionImgeAlt: "" });
  }, []);
  const handleArticleImageAltChange = useCallback((value) => {
    setArticleImageAlt(value);
    setIsChanged(true);
    setErrors({ ...errors, articleImageAlt: "" });
  }, []);

  const handleSubmit = () => {
    const altTextChenge = [];
    if (productImageAlt !== data.data.altText.product) {
      altTextChenge.push("product");
    }
    if (collectionImgeAlt !== data.data.altText.collection) {
      altTextChenge.push("collection");
    }
    if (articleImageAlt !== data.data.altText.article) {
      altTextChenge.push("article");
    }

    if (productImageAlt.length > 125 || productImageAlt.length < 1) {
      return setErrors({
        ...errors,
        productImageAlt: `Product Image Alt must be between 1 to 125 characters `,
      });
    }
    if (collectionImgeAlt.length > 125 || collectionImgeAlt.length < 1) {
      return setErrors({
        ...errors,
        collectionImgeAlt: `Collection Image Alt must be between 1 to 125 characters`,
      });
    }
    if (articleImageAlt.length > 125 || articleImageAlt.length < 1) {
      return setErrors({
        ...errors,
        articleImageAlt: `Article Image Alt must be between 1 to 125 characters`,
      });
    }

    runBulkImageUpdate({
      type: "altText",
      data: {
        altTextChenge,
        product: productImageAlt,
        collection: collectionImgeAlt,
        article: articleImageAlt,
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
              <Button primary icon={RefreshIcon} loading={isBulkAltUpdating} onClick={handleSubmit}>
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
                            <Text variant="headingMd">Product Image Alt</Text>
                            <Text variant="bodyMd">Can use variables in the PRODUCT and SHOP section</Text>
                          </VerticalStack>
                        </Layout.Section>
                        <Layout.Section>
                          <Box>
                            <AlphaCard>
                              <FormLayout>
                                <TextField
                                  value={productImageAlt}
                                  onChange={handleProductImageAltChange}
                                  label={<Text variant="headingSm">Alt Text</Text>}
                                  placeholder="Enter alt text or use variables"
                                  type="text"
                                  error={errors?.productImageAlt}
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
                            <Text variant="headingMd">Collection Image Alt</Text>
                            <Text variant="bodyMd">Can use variables in the COLLECTION and SHOP section</Text>
                          </VerticalStack>
                        </Layout.Section>
                        <Layout.Section>
                          <Box>
                            <AlphaCard>
                              <FormLayout>
                                <TextField
                                  value={collectionImgeAlt}
                                  onChange={handleCollectionImageAltChange}
                                  label={<Text variant="headingSm">Alt Text</Text>}
                                  placeholder="Enter alt text or use variables"
                                  type="text"
                                  error={errors?.collectionImgeAlt}
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
                            <Text variant="bodyMd">Can use variables in the BLOG POST and SHOP section</Text>
                            <Box paddingBlockStart={"4"}></Box>
                          </VerticalStack>
                        </Layout.Section>
                        <Layout.Section>
                          <Box>
                            <AlphaCard>
                              <FormLayout>
                                <TextField
                                  value={articleImageAlt}
                                  onChange={handleArticleImageAltChange}
                                  label={<Text variant="headingSm">Alt Text</Text>}
                                  placeholder="Enter alt text or use variables"
                                  type="text"
                                  error={errors?.articleImageAlt}
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
                      Use custom text and variables to create alt text templates for images. Your custom text works as a
                      static template, while the variables pull in dynamic values from your store's content.
                    </Text>
                    <Box paddingBlockStart={"3"}>
                      <Text variant="bodyMd" fontWeight="bold">
                        Use the following variables exactly as listed, including whitespace, to set image alt text.
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
