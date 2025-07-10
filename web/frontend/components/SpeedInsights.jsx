import { useState } from "react";
import { Tabs, Box, BlockStack, Divider } from "@shopify/polaris";

import SiteSpeedUpPage from "./Tabs/SiteSpeedUpPage";
import ImageOptimizationPage from "./Tabs/ImageOptimizationPage";
import AMPPage from "./Tabs/AMPPage";

export default function SpeedInsights() {
  const [selected, setSelected] = useState(0);

  const handleTabChange = (selectedTabIndex) => {
    setSelected(selectedTabIndex);
  };

  const tabs = [
    {
      id: "site-speed-up",
      content: "Site Speed Up",
      accessibilityLabel: "Site Speed Up",
      panelID: "site-speed-up-content",
      component: <SiteSpeedUpPage />,
    },
    {
      id: "image-optimization",
      content: "Image Optimization",
      accessibilityLabel: "Image Optimization",
      panelID: "image-optimization-content",
      component: <ImageOptimizationPage />,
    },
    {
      id: "amp",
      content: "AMP",
      accessibilityLabel: "AMP",
      panelID: "amp-content",
      component: <AMPPage />,
    },
  ];

  return (
    <>
      <BlockStack gap="500">
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          <Divider borderWidth="0165" borderColor="border-brand" />
          <Box paddingBlockStart={"200"}>{tabs[selected]?.component}</Box>
        </Tabs>
      </BlockStack>
    </>
  );
}
