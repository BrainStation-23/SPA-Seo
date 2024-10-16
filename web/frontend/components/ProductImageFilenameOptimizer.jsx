import React, { useState, useCallback } from "react";
import {
  Box,
  Layout,
  HorizontalStack,
  Thumbnail,
  VerticalStack,
  Text,
  AlphaCard,
  List,
  Divider,
  TextField,
  Button,
} from "@shopify/polaris";
import { useUI } from "../contexts/ui.context";
import { useSingleImageFilenameUpdate } from "../hooks/useImageOptimizer";

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
  const { mutate: updateFilename } = useSingleImageFilenameUpdate();
  const [filename, setFilename] = useState(prev_filename);

  const handleFilenameChange = useCallback((value) => {
    setFilename(value);
  }, []);

  return (
    <HorizontalStack gap={"2"} blockAlign="center">
      <Thumbnail source={image?.url ? image?.url : image?.src} />
      <HorizontalStack gap={"1"}>
        <Box width="400px">
          <TextField
            onChange={handleFilenameChange}
            value={filename}
            type="text"
          />
        </Box>{" "}
        <Text>{fileExt}</Text>
      </HorizontalStack>
      <Button
        primary
        onClick={() => {
          // id, fileNameSettings, fileExt, product, shop
          updateFilename({
            id: image.id,
            fileNameSettings: filename,
            fileExt: fileExt,
            productId: product.id,
            shop: shop,
          });
        }}
      >
        Save
      </Button>
    </HorizontalStack>
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
  console.log("product", product, shop);
  return (
    <Box paddingBlockStart={"2"}>
      <Text variant="headingMd">Product Image Filename Optimizer</Text>
      <Layout>
        <Layout.Section>
          <Box paddingBlockStart={"4"}>
            <VerticalStack gap={"4"}>
              {images?.map((image, index) => (
                <ImageTextField
                  key={index}
                  image={image}
                  product={product}
                  shop={shop}
                />
              ))}
            </VerticalStack>
          </Box>
        </Layout.Section>
        <Layout.Section oneThird>
          <VerticalStack gap={"2"}>
            <AlphaCard background="bg-app-selected">
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
            </AlphaCard>
            <AlphaCard padding={"0"} background="bg-app-selected">
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
  );
}
