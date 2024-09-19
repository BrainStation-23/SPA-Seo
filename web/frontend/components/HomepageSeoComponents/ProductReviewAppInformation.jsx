import React, { useCallback, useState } from "react";
import {
  Layout,
  Box,
  Text,
  AlphaCard,
  VerticalStack,
  TextField,
} from "@shopify/polaris";

export default function ProductReviewInformation() {
  const [logourl, setLogoUrl] = useState(null);

  const handleLogoUrlChange = useCallback((value) => setLogoUrl(value), []);

  return (
    <Box paddingBlockStart={"6"} paddingBlockEnd={"5"}>
      <Layout>
        <Layout.Section oneThird>
          <Box paddingBlockEnd={"4"}>
            <Text variant="headingMd">Product Review App</Text>
          </Box>
          <Box>
            <Text variant="bodyMd">
              Add reviews to your Google search result and see a significant
              increase in click through rates.
            </Text>
          </Box>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Box>
            <AlphaCard>
              <VerticalStack gap={"4"}>
                <Text variant="headingSm">Feature coming soon</Text>
              </VerticalStack>
            </AlphaCard>
          </Box>
        </Layout.Section>
      </Layout>
    </Box>
  );
}
