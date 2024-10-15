import React from "react";
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

export function ProductImageFilenameOptimizer() {
  const { modal, shop } = useUI();
  const product = modal?.data?.info;
  const images = product?.images.edges.map((e) => e.node);
  console.log("product", product);
  return (
    <Box paddingBlockStart={"2"}>
      <Text variant="headingMd">Product Image Filename Optimizer</Text>
      <Layout>
        <Layout.Section>
          <Box paddingBlockStart={"4"}>
            <VerticalStack gap={"2"}>
              {images?.map((image, index) => (
                <HorizontalStack gap={"2"} blockAlign="center">
                  <Thumbnail source={image?.url ? image?.url : image?.src} />
                  <Box width="450px">
                    <TextField minLength={"100px"} value={""} type="text" />
                  </Box>
                  <Button primary>Save</Button>
                </HorizontalStack>
              ))}
            </VerticalStack>
          </Box>
        </Layout.Section>
        <Layout.Section oneThird>
          <VerticalStack gap={"2"}>
            <AlphaCard background="bg-app-selected">
              <Text variant="bodyMd">
                You can use the following variables in the image alt and
                filename fields to dynamically generate the content based on the
                product and shop information.
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