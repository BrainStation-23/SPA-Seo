import React, { useState } from "react";
import { Layout, Box, Text, Card, BlockStack, Button } from "@shopify/polaris";
import Switch from "../commonUI/Switch/Switch";
import { useHomeSeo } from "../../contexts/home.context";

export default function ContactInformation() {
  const { organization, setOrganization } = useHomeSeo();
  const handleCheckedChange = () => {
    setOrganization({
      ...organization,
      showContact: !organization.showContact,
    });
  };
  return (
    <Box paddingBlockStart={"6"} paddingBlockEnd={"5"}>
      <Layout>
        <Layout.Section oneThird>
          <Box paddingBlockEnd={"4"}>
            <Text variant="headingMd">Show Contact Inaformation</Text>
          </Box>
          <Box>
            <Text variant="bodyMd">
              Allow showing of information like phone number and address.
            </Text>
          </Box>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Box>
            <Card>
              <BlockStack gap={"6"}>
                <Text variant="bodyMd">
                  This will include phone and address details of your business
                  in Google JSONLD data.
                </Text>
                <BlockStack gap={"2"}>
                  <Text variant="headingSm">Status</Text>
                  <Switch
                    checked={organization?.showContact}
                    handleClick={handleCheckedChange}
                  />
                </BlockStack>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Box>
  );
}
