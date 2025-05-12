import React, { useState } from "react";
import {
  Card,
  Tabs,
  Text,
  Box,
  Button,
  Icon,
  Badge,
  BlockStack,
  InlineStack,
  ButtonGroup,
} from "@shopify/polaris";
import {
  MobileIcon,
  DesktopIcon,
  InfoIcon,
  LightbulbIcon,
} from "@shopify/polaris-icons";
import { SpeedFeatureCard } from "./SpeedFeatureCard";
import { useSeoLeazyLoaddingQuery } from "../hooks/useShopQuery";

export default function SpeedInsights() {
    const { data: lazyLoadingData, isLoading: lazyLoadingLoading } = useSeoLeazyLoaddingQuery({ url: "api/seo/lazy-loading" });
   console.log('data',lazyLoadingData)
  const [selected, setSelected] = useState(0);
  const [instantPageEnabled, setInstantPageEnabled] = useState(true);

  const handleTabChange = (selectedTabIndex) => {
    setSelected(selectedTabIndex);
  };

  const tabs = [
    {
      id: "site-speed-up",
      content: "Site Speed Up",
      accessibilityLabel: "Site Speed Up",
      panelID: "site-speed-up-content",
    },
    {
      id: "image-optimization",
      content: "Image Optimization",
      accessibilityLabel: "Image Optimization",
      panelID: "image-optimization-content",
    },
    {
      id: "amp",
      content: "AMP",
      accessibilityLabel: "AMP",
      panelID: "amp-content",
    },
  ];

  return (
    <>
      <BlockStack gap="500">
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />

        <InlineStack gap="500" wrap={false}>
          {/* Left card - SEO Score */}
          <Box width="30%">
            <Card sectioned>
              <BlockStack gap="4">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    SEO Score
                  </Text>
                  <ButtonGroup segmented>
                    <Button icon={MobileIcon} />
                    <Button icon={DesktopIcon} variant="primary" />
                  </ButtonGroup>
                </InlineStack>

                <Box paddingBlock="4" textAlign="center">
                  <div
                    style={{
                      position: "relative",
                      width: "160px",
                      height: "160px",
                      margin: "0 auto",
                      borderRadius: "50%",
                      background: "#FFF9E8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "160px",
                        height: "160px",
                      }}
                    >
                      <svg width="160" height="160" viewBox="0 0 160 160">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#FFC046"
                          strokeWidth="14"
                          strokeDasharray="440"
                          strokeDashoffset="140"
                          transform="rotate(-90, 80, 80)"
                        />
                      </svg>
                    </div>
                    <Text as="p" variant="heading3xl">
                      62
                    </Text>
                  </div>
                </Box>

                <Text as="h3" variant="headingMd">
                  Performance
                </Text>

                <InlineStack wrap={true} gap="400">
                  <Box width="45%">
                    <MetricItem
                      label="Speed Index"
                      value="3.9 s"
                      color="critical"
                    />
                  </Box>
                  <Box width="45%">
                    <MetricItem
                      label="Total Blocking Time"
                      value="3.9 s"
                      color="critical"
                    />
                  </Box>
                  <Box width="45%">
                    <MetricItem
                      label="First Contentful Paint"
                      value="3.9 s"
                      color="critical"
                    />
                  </Box>
                  <Box width="45%">
                    <MetricItem
                      label="Largest Contentful Paint"
                      value="3.9 s"
                      color="critical"
                    />
                  </Box>
                </InlineStack>
                <MetricItem
                  label="Cumulative Layout Shift"
                  value="3.9 s"
                  color="critical"
                />
              </BlockStack>
            </Card>
          </Box>

          {/* Right section - Speed Up Features */}
          <Box width="70%">
            <BlockStack gap="200">
              <Card>
                <InlineStack align="space-between">
                  <InlineStack gap="200">
                    <Text as="h2" variant="headingMd">
                      Speed Up effect
                    </Text>
                    <Badge tone="success">Basic Plan</Badge>
                  </InlineStack>
                  <Button size="medium" icon={LightbulbIcon}>
                    Speed up Now
                  </Button>
                </InlineStack>

                <Text as="h4" variant="headingSm">
                  Performance
                </Text>
              </Card>

              <SpeedFeatureCard
                title="Instant Page"
                badgeText="On"
                badgeType="basic"
                description="instant.page preloads pages 65ms into a hover to speed up likely clicks"
                isPro={false}
                isEnabled={true}
              />
              <SpeedFeatureCard
                title="Lazy-loading"
                badgeText="Pro plan"
                badgeType="pro"
                description="instant.page preloads pages 65ms into a hover to speed up likely clicks"
                isPro={true}
                isEnabled={true}
              />
              <SpeedFeatureCard
                title="Streamlined Loading"
                badgeText="Pro plan"
                badgeType="pro"
                description="instant.page preloads pages 65ms into a hover to speed up likely clicks"
                isPro={true}
                isEnabled={true}
              />
              <SpeedFeatureCard
                title="Optimized Loading"
                badgeText="Pro plan"
                badgeType="pro"
                description="instant.page preloads pages 65ms into a hover to speed up likely clicks"
                isPro={true}
                isEnabled={true}
              />
              <SpeedFeatureCard
                title="Asset File Optimization"
                badgeText="Pro plan"
                badgeType="pro"
                description="instant.page preloads pages 65ms into a hover to speed up likely clicks"
                isPro={true}
                isEnabled={true}
              />
              <SpeedFeatureCard
                title="Streamline Code"
                badgeText="Pro plan"
                badgeType="pro"
                description="instant.page preloads pages 65ms into a hover to speed up likely clicks"
                isPro={true}
                isEnabled={true}
              />
            </BlockStack>
          </Box>
        </InlineStack>
      </BlockStack>
    </>
  );
}

export function MetricItem({ label, value, color }) {
  return (
    <Box paddingBlockEnd="4">
      <Text as="p" variant="bodyMd">
        {label}
      </Text>
      <Text as="p" variant="heading2xl" color={color}>
        {value}
      </Text>
    </Box>
  );
}
