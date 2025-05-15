import React, { useState, useEffect } from "react";
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
  StatusActiveIcon,
} from "@shopify/polaris-icons";
import { SpeedFeatureCard } from "./SpeedFeatureCard";
import { useUI } from "../contexts/ui.context";
import { useSpeedUpWithProgress } from "../hooks/useSpeedUpWithProgress";

export default function SpeedInsights() {
  const [selected, setSelected] = useState(0);
  const { appBilling, speedInsights } = useUI();
  console.log("🚀 ~ SpeedInsights ~ appBilling:", appBilling, speedInsights);

  const [instantPage, setInstantPage] = useState(false);
  const [lazyLoading, setLazyLoading] = useState(false);
  const [streamlinedLoading, setStreamlinedLoading] = useState(false);
  const [optimizedLoading, setOptimizedLoading] = useState(false);
  const [assetFileOptimization, setAssetFileOptimization] = useState(false);
  const [streamlineCode, setStreamlineCode] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const { taskCount, compleatedTask, progress, startTaks, resetProgress } =
    useSpeedUpWithProgress();

  const handleSpeedupButtonClick = () => {
    let currentTaskCount = taskCount,
      taskQueue = {};

    if (instantPage !== speedInsights.isInstantPage) {
      taskQueue["isInstantPage"] = instantPage;
      currentTaskCount++;
    }
    if (lazyLoading !== speedInsights.isLazyLoading) {
      taskQueue["isLazyLoading"] = lazyLoading;
      currentTaskCount++;
    }
    if (streamlinedLoading !== speedInsights.isStreamLineLoading) {
      taskQueue["isStreamLineLoading"] = streamlinedLoading;
      currentTaskCount++;
    }
    if (optimizedLoading !== speedInsights.isOptimizedLoading) {
      taskQueue["isOptimizedLoading"] = optimizedLoading;
      currentTaskCount++;
    }
    if (assetFileOptimization !== speedInsights.isAssetFileOptimization) {
      taskQueue["isAssetFileOptimization"] = assetFileOptimization;
      currentTaskCount++;
    }
    if (streamlineCode !== speedInsights.isStreamlineCode) {
      taskQueue["isStreamlineCode"] = streamlineCode;
      currentTaskCount++;
    }

    if (currentTaskCount === 0) return;

    startTaks(taskQueue, currentTaskCount);
    setShowDropdown(true);
  };
  const handleStopButtonClick = () => {
    resetProgress();
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

  useEffect(() => {
    setInstantPage(speedInsights.isInstantPage);
    setLazyLoading(speedInsights.isLazyLoading);
    setStreamlineCode(speedInsights.isStreamlineCode);
    setOptimizedLoading(speedInsights.isOptimizedLoading);
    setStreamlinedLoading(speedInsights.isStreamLineLoading);
    setAssetFileOptimization(speedInsights.isAssetFileOptimization);
  }, [speedInsights]);

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
                      tone={progress < 100 ? "critical" : "success"}
                      size="large"
                      icon={progress < 100 ? StopCircleIcon : StatusActiveIcon}
                      onClick={handleStopButtonClick}
                    >
                      {progress < 100 ? "Stop" : "Done"}
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
                isPro={true}
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
                isPro={
                  appBilling?.status === "ACTIVE" &&
                  (appBilling?.name === "Pro" || appBilling?.name === "Plus")
                }
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
                isPro={
                  appBilling?.status === "ACTIVE" &&
                  (appBilling?.name === "Pro" || appBilling?.name === "Plus")
                }
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
                isPro={
                  appBilling?.status === "ACTIVE" &&
                  (appBilling?.name === "Pro" || appBilling?.name === "Plus")
                }
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
                isPro={
                  appBilling?.status === "ACTIVE" &&
                  (appBilling?.name === "Pro" || appBilling?.name === "Plus")
                }
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
                isPro={
                  appBilling?.status === "ACTIVE" &&
                  (appBilling?.name === "Pro" || appBilling?.name === "Plus")
                }
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
