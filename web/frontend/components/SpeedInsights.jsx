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
  Divider,
  ProgressBar,
} from "@shopify/polaris";
import {
  MobileIcon,
  DesktopIcon,
  InfoIcon,
  LightbulbIcon,
  StopCircleIcon,
} from "@shopify/polaris-icons";
import { SpeedFeatureCard } from "./SpeedFeatureCard";
import { useSeoLeazyLoaddingQuery } from "../hooks/useShopQuery";
import { useUI } from "../contexts/ui.context";
import useFetchQuery from "../hooks/useGlobalQuery";
import useFetchMutation from "../hooks/useGlobalMutation";
import { fetchWithProgess } from "../utils/fetchWithProgress";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

export default function SpeedInsights() {
  const { data: lazyLoadingData, isLoading: lazyLoadingLoading } =
    useSeoLeazyLoaddingQuery({ url: "api/seo/lazy-loading" });
  console.log("data", lazyLoadingData);
  const [selected, setSelected] = useState(0);
  const { isLoading, data } = useFetchQuery({
    apiEndpoint: "/api/billing/get-store-info",
    apiKey: "getActiveSubscription",
    dependency: [],
  });

  const { appBilling, speedInsights } = useUI();
  console.log("🚀 ~ SpeedInsights ~ appBilling:", appBilling, speedInsights);

  const [progress, setProgress] = useState(0);
  const [compleatedTask, setCompleatedTask] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [siteSpeedUpState, setSiteSpeedUpState] = useState({
    instantPage: false,
    lazyLoading: false,
    streamlinedLoading: false,
    optimizedLoading: false,
    assetFileOptimization: false,
    streamlineCode: false,
  });
  const [instantPage, setInstantPage] = useState(false);
  const [lazyLoading, setLazyLoading] = useState(false);
  const [streamlinedLoading, setStreamlinedLoading] = useState(false);
  const [optimizedLoading, setOptimizedLoading] = useState(false);
  const [assetFileOptimization, setAssetFileOptimization] = useState(false);
  const [streamlineCode, setStreamlineCode] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);

  // Ami choto amake marben na
  // ami asolei choto marben na plz
  const fetcher = useAuthenticatedFetch();
  const handleSpeedupButtonClick = () => {
    let currentTaskCount = taskCount,
      taskQueue = {};

    if (instantPage !== siteSpeedUpState.instantPage) {
      taskQueue["instantPage"] = instantPage;
      currentTaskCount++;
    }
    if (lazyLoading !== siteSpeedUpState.lazyLoading) {
      taskQueue["lazyLoading"] = lazyLoading;
      currentTaskCount++;
    }
    if (streamlinedLoading !== siteSpeedUpState.streamlinedLoading) {
      taskQueue["streamlinedLoading"] = streamlinedLoading;
      currentTaskCount++;
    }
    if (optimizedLoading !== siteSpeedUpState.optimizedLoading) {
      taskQueue["optimizedLoading"] = optimizedLoading;
      currentTaskCount++;
    }
    if (assetFileOptimization !== siteSpeedUpState.assetFileOptimization) {
      taskQueue["assetFileOptimization"] = assetFileOptimization;
      currentTaskCount++;
    }
    if (streamlineCode !== siteSpeedUpState.streamlineCode) {
      taskQueue["streamlineCode"] = streamlineCode;
      currentTaskCount++;
    }

    fetchWithProgess(
      taskQueue,
      fetcher,
      setProgress,
      setCompleatedTask,
      setSiteSpeedUpState
    );
    setTaskCount(currentTaskCount);
    setShowDropdown(true);
  };
  const handleStopButtonClick = () => {
    setProgress(0);
    setTaskCount(0);
    setCompleatedTask(0);
    setShowDropdown(false);
  };

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
                  <InlineStack blockAlign="center" gap="200">
                    <Text as="h2" variant="headingMd">
                      Speed Up effect
                    </Text>
                    <Badge tone="success">Basic Plan</Badge>
                  </InlineStack>
                  {!showDropdown ? (
                    <Button
                      variant="primary"
                      size="large"
                      icon={LightbulbIcon}
                      onClick={handleSpeedupButtonClick}
                    >
                      Speed up Now
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="large"
                      icon={StopCircleIcon}
                      onClick={handleStopButtonClick}
                    >
                      Stop
                    </Button>
                  )}
                </InlineStack>

                <Text as="h4" variant="bodySm">
                  Performance
                </Text>

                {showDropdown && (
                  <Box paddingBlock={"150"}>
                    <BlockStack gap={"200"}>
                      <Divider borderWidth="050" />
                      <Text variant="bodySm">
                        Speed up process {compleatedTask}/{taskCount} tasks
                      </Text>
                      <ProgressBar
                        animated
                        progress={progress}
                        size="small"
                        tone="primary"
                      />
                    </BlockStack>
                  </Box>
                )}
              </Card>

              <SpeedFeatureCard
                title="Instant Page"
                badgeText="On"
                badgeType="basic"
                description="instant.page preloads pages 65ms into a hover to speed up likely clicks"
                isPro={false}
                isEnabled={instantPage}
                featureName={"instantPage"}
                handler={() => {
                  setInstantPage((prev) => !prev);
                }}
              />
              <SpeedFeatureCard
                title="Lazy-loading"
                badgeText="Pro plan"
                badgeType="pro"
                description="instant.page preloads pages 65ms into a hover to speed up likely clicks"
                isPro={false}
                isEnabled={lazyLoading}
                featureName={"lazyLoading"}
                handler={() => {
                  setLazyLoading((prev) => !prev);
                }}
              />
              <SpeedFeatureCard
                title="Streamlined Loading"
                badgeText="Pro plan"
                badgeType="pro"
                description="instant.page preloads pages 65ms into a hover to speed up likely clicks"
                isPro={false}
                isEnabled={streamlinedLoading}
                featureName={"streamlinedLoading"}
                handler={() => {
                  setStreamlinedLoading((prev) => !prev);
                }}
              />
              <SpeedFeatureCard
                title="Optimized Loading"
                badgeText="Pro plan"
                badgeType="pro"
                description="instant.page preloads pages 65ms into a hover to speed up likely clicks"
                isPro={false}
                isEnabled={optimizedLoading}
                featureName={"optimizedLoading"}
                handler={() => {
                  setOptimizedLoading((prev) => !prev);
                }}
              />
              <SpeedFeatureCard
                title="Asset File Optimization"
                badgeText="Pro plan"
                badgeType="pro"
                description="instant.page preloads pages 65ms into a hover to speed up likely clicks"
                isPro={false}
                isEnabled={assetFileOptimization}
                featureName={"assetFileOptimization"}
                handler={() => {
                  setAssetFileOptimization((prev) => !prev);
                }}
              />
              <SpeedFeatureCard
                title="Streamline Code"
                badgeText="Pro plan"
                badgeType="pro"
                description="instant.page preloads pages 65ms into a hover to speed up likely clicks"
                isPro={false}
                isEnabled={streamlineCode}
                featureName={"streamlineCode"}
                handler={() => {
                  setStreamlineCode((prev) => !prev);
                }}
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
