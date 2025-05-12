import React from "react";
import { Layout, Box, Text, Card, BlockStack, Select } from "@shopify/polaris";
import { useHomeSeo } from "../../contexts/home.context";

export default function BusinessTypeInformation() {
  const { organization, setOrganization } = useHomeSeo();
  const options = [
    {
      label: "Organization",
      value: "Organization",
    },
    { label: "Local Business", value: "LocalBusiness" },
  ];

  const handleSelectChange = (value) => {
    setOrganization({ ...organization, businessType: value });
  };
  function getIndustryValue(value) {
    const industry = options.find((option) => option.value === value);
    return industry ? industry.value : "other";
  }

  return (
    <Box paddingBlockStart={"5"} paddingBlockEnd={"5"}>
      <Layout>
        <Layout.Section oneThird>
          <Box paddingBlockEnd={"4"}>
            <Text variant="headingMd">Business type</Text>
          </Box>
          <Box>
            <Text variant="bodyMd">
              Let search engines like Google know your business type.
            </Text>
          </Box>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Box>
            <Card>
              <BlockStack gap={"6"}>
                <Select
                  label="Select business type"
                  options={options}
                  onChange={handleSelectChange}
                  value={getIndustryValue(organization?.businessType)}
                />
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Box>
  );
}
