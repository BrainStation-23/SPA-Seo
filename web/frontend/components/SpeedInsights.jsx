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
import { useUI } from "../contexts/ui.context";
import useFetchQuery from "../hooks/useGlobalQuery";
import {
  getColorFromScore,
  getToneFromCLS,
  getToneFromFCP,
  getToneFromLCP,
  getToneFromSpeedIndex,
  getToneFromTBT,
} from "../utils/speedCalculations";

export default function SpeedInsights() {
  const [selected, setSelected] = useState(0);
  const [device, setDevice] = useState("desktop");
  const [instantPageEnabled, setInstantPageEnabled] = useState(true);
  const { isLoading, data } = useFetchQuery({
    apiEndpoint: "/api/billing/get-store-info",
    apiKey: "getActiveSubscription",
    dependency: [],
  });

  const { isLoading: isInsightsLoading, data: insightsData } = useFetchQuery({
    apiEndpoint: `/api/seo/insights?device=${device}`,
    apiKey: "seoInsights",
    dependency: [device],
  });
  console.log("🚀 ~ SpeedInsights ~ insightsData:", insightsData);

  const { appBilling, speedInsights } = useUI();
  console.log("🚀 ~ SpeedInsights ~ appBilling:", appBilling, speedInsights);

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
                    <Button
                      icon={MobileIcon}
                      onClick={() => setDevice("mobile")}
                    />
                    <Button
                      icon={DesktopIcon}
                      variant="primary"
                      onClick={() => setDevice("desktop")}
                    />
                  </ButtonGroup>
                </InlineStack>

                <SeoScore score={insightsData?.score || 0} />
                <InlineStack wrap={true} gap="200">
                  <Text as="h3" variant="headingMd">
                    Performance
                  </Text>

                  <InlineStack wrap={true} gap="200">
                    <Box width="45%">
                      <MetricItem
                        label="Speed Index"
                        value={insightsData?.performance?.speedIndex}
                        color={getToneFromSpeedIndex(
                          insightsData?.performance?.speedIndex
                        )}
                      />
                    </Box>
                    <Box width="45%">
                      <MetricItem
                        label="Total Blocking Time"
                        value={insightsData?.performance?.totalBlockingTime}
                        color={getToneFromTBT(
                          insightsData?.performance?.totalBlockingTime
                        )}
                      />
                    </Box>
                    <Box width="45%">
                      <MetricItem
                        label="First Contentful Paint"
                        value={insightsData?.performance?.firstContentfulPaint}
                        color={getToneFromFCP(
                          insightsData?.performance?.firstContentfulPaint
                        )}
                      />
                    </Box>
                    <Box width="45%">
                      <MetricItem
                        label="Largest Contentful Paint"
                        value={
                          insightsData?.performance?.largestContentfulPaint
                        }
                        color={getToneFromLCP(
                          insightsData?.performance?.largestContentfulPaint
                        )}
                      />
                    </Box>
                  </InlineStack>
                  <MetricItem
                    label="Cumulative Layout Shift"
                    value={insightsData?.performance?.cumulativeLayoutShift}
                    color={getToneFromCLS(
                      insightsData?.performance?.cumulativeLayoutShift
                    )}
                  />
                </InlineStack>
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
      <div
        className="matrix_results-value"
        style={{
          color: color,
        }}
      >
        {value}
      </div>
    </Box>
  );
}

function SeoScore({ score }) {
  // Circle constants
  const radius = 70;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke offset
  const progress = Math.min(Math.max(score, 0), 100); // clamp between 0-100
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return (
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
              r={radius}
              fill="none"
              stroke={getColorFromScore(score)}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90, 80, 80)"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <Text as="p" variant="heading3xl">
          {score}
        </Text>
      </div>
    </Box>
  );
}
