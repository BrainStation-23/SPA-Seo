import React from "react";
import {
  Layout,
  Box,
  Text,
  Card,
  BlockStack,
  TextField,
} from "@shopify/polaris";
import { useHomeSeo } from "../../contexts/home.context";

export default function BrandInformation() {
  const { organization, setOrganization } = useHomeSeo();
  let name = organization.brand.name,
    bLogo = organization.brand.logo;
  const handleTextFieldChange = (value) => {
    setOrganization({ ...organization, brand: { name: value, logo: bLogo } });
  };
  const handleBrandLogoChange = (value) => {
    setOrganization({ ...organization, brand: { name, logo: value } });
  };

  return (
    <Box paddingBlockStart={"6"} paddingBlockEnd={"5"}>
      <Layout>
        <Layout.Section oneThird>
          <Box paddingBlockEnd={"4"}>
            <Text variant="headingMd">Brand Inaformation</Text>
          </Box>
          <Box>
            <Text variant="bodyMd">
              Set your Brand Information here. This will be used uniformly
              across your SEO best practices.
            </Text>
          </Box>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Box>
            <Card>
              <BlockStack gap={"4"}>
                <TextField
                  label="Brand Name"
                  value={organization?.brand?.name}
                  placeholder="Some really cool brand name"
                  onChange={handleTextFieldChange}
                ></TextField>
                {organization?.businessType === "LocalBusiness" && (
                  <TextField
                    label="Brand Image"
                    value={organization?.brand?.logo}
                    placeholder="Enter your brand image URL here"
                    onChange={handleBrandLogoChange}
                  ></TextField>
                )}
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Box>
  );
}
