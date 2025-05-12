import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Layout,
  InlineStack,
  Thumbnail,
  BlockStack,
  Text,
  Card,
  List,
  Divider,
  TextField,
  Button,
  Banner,
} from "@shopify/polaris";
import { useUI } from "../contexts/ui.context";
import { useSingleImageFilenameUpdate } from "../hooks/useImageOptimizer";
import { validateFilename } from "../utils/validFileName";

function parseFilenameFromSrc(url) {
  const full_filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
  const filename_without_extension = full_filename.substring(
    0,
    full_filename.lastIndexOf(".")
  );
  const fileExtension = full_filename.substring(full_filename.lastIndexOf("."));
  return { filename: filename_without_extension, fileExt: fileExtension };
}

function ImageTextField({ image, product, shop }) {
  const { filename: prev_filename, fileExt } = parseFilenameFromSrc(image?.url);
  const { mutate: updateFilename, isLoading } = useSingleImageFilenameUpdate();
  const [filename, setFilename] = useState(prev_filename);
  const [errors, setErrors] = useState("");

  const handleFilenameChange = useCallback((value) => {
    setFilename(value);
    setErrors("");
  }, []);

  const handleSave = () => {
    const validationError = validateFilename(filename);
    if (validationError) {
      setErrors(validationError);
      return;
    }

    updateFilename({
      id: image.id,
      fileNameSettings: filename,
      fileExt: fileExt,
      productId: product.id,
      shop: shop,
    });
    setErrors("");
  };
  return (
    <InlineStack gap={"2"} blockAlign="center">
      <Thumbnail source={image?.url ? image?.url : image?.src} />
      <InlineStack gap={"1"}>
        <Box width="400px">
          <TextField
            onChange={handleFilenameChange}
            value={filename}
            type="text"
            error={errors}
          />
        </Box>
        <Text>{fileExt}</Text>
      </InlineStack>
      <Button
        loading={isLoading}
        disabled={filename === prev_filename}
        primary
        onClick={handleSave}
      >
        Save
      </Button>
    </InlineStack>
  );
}

export function ProductImageFilenameOptimizer() {
  const { modal, shop } = useUI();

  const product = modal?.data?.info;
  const images = product?.media.edges
    .filter((e) => e.node.mediaContentType === "IMAGE")
    .map((e) => {
      const node = e.node;
      return {
        id: node.id,
        url: node.preview.image.url,
        altText: node.alt,
        originalSrc: node.preview.image.url,
      };
    });
  return (
    <Box paddingBlockStart={"2"}>
      <Text variant="headingMd">Product Image Filename Optimizer</Text>
      <div style={{ marginBottom: "1rem" }}></div>
      <Layout>
        <Layout.Section>
          <Box paddingBlockStart={"4"}>
            <BlockStack gap={"4"}>
              {images?.map((image, index) => (
                <ImageTextField
                  key={index}
                  image={image}
                  product={product}
                  shop={shop}
                />
              ))}
            </BlockStack>
          </Box>
          <Box paddingBlockStart={"10"}>
            <Banner title="Filename Guidelines" status="warning">
              <List>
                <List.Item>
                  Keep your filename relevant to the actual content .
                </List.Item>
                <List.Item>
                  Avoid keyword stuffing in filenames; use a concise,
                  descriptive name instead.
                </List.Item>
                <List.Item>
                  Keep filenames short—ideally 5 words or fewer.
                </List.Item>
                <List.Item>
                  Separate words with hyphens (e.g., "apple-food.jpg").
                </List.Item>
                <List.Item>
                  Avoid using generic names like "IMG1234.jpg" or overly key
                  word names like "Best-food-planner.jpg."
                </List.Item>
              </List>
            </Banner>
          </Box>
        </Layout.Section>
        <Layout.Section oneThird>
          <BlockStack gap={"2"}>
            <Card background="bg-app-selected">
              <Text variant="bodyMd">
                You can use the following variables to dynamically generate the
                content based on the product and shop information.
              </Text>
              <Box paddingBlockStart={"3"}>
                <Text variant="bodyMd" fontWeight="bold">
                  Use the following variables exactly as listed, including
                  whitespace, to set image alt text.
                </Text>
              </Box>
            </Card>
            <Card padding={"0"} background="bg-app-selected">
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
  );
}
