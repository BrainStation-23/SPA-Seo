import React, { useCallback, useState } from "react";
import {
  Layout,
  Box,
  Text,
  Card,
  BlockStack,
  TextField,
} from "@shopify/polaris";
import { useHomeSeo } from "../../contexts/home.context";

export default function CompanyLogoInformation() {
  const { organization, setOrganization } = useHomeSeo();
  const handleLogoUrlChange = (value) => {
    setOrganization({ ...organization, logo: value });
  };

  return (
    <Box paddingBlockStart={"6"} paddingBlockEnd={"5"}>
      <Layout>
        <Layout.Section oneThird>
          <Box paddingBlockEnd={"4"}>
            <Text variant="headingMd">Company Logo URL</Text>
          </Box>
          <Box>
            <Text variant="bodyMd">
              Search engines like Google will enhance certain search results by
              displaying your logo.
            </Text>
          </Box>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Box>
            <Card>
              <BlockStack gap={"4"}>
                <Text variant="headingSm">Company logo URL</Text>
                <TextField
                  helpText="This is an optional step, we'll find your logo automatically if you leave this empty."
                  value={organization?.logo}
                  placeholder="Paste your company logo URL here"
                  onChange={handleLogoUrlChange}
                ></TextField>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Box>
  );
}
