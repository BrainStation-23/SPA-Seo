import {
  Card,
  Text,
  Box,
  Button,
  Icon,
  Badge,
  InlineStack,
} from "@shopify/polaris";
import { InfoIcon } from "@shopify/polaris-icons";
import { Toggle } from "./commonUI/toggle/Toggle";

export function SpeedFeatureCard({
  title,
  badgeText,
  description,
  isPro = false,
  isEnabled = false,
  featureName,
  handler = () => {},
}) {
  return (
    <Card sectioned>
      <InlineStack wrap={false} align="space-between">
        <InlineStack align="center" gap="200">
          <Text as="h3" variant="headingMd">
            {title}
          </Text>
          {badgeText && (
            <Badge tone={isPro && isEnabled ? "success" : ""}>
              {isPro ? (isEnabled ? "On" : "Off") : "Pro plan"}
            </Badge>
          )}
          <Icon source={InfoIcon} color="subdued" />
        </InlineStack>
        {!isPro ? (
          <Button size="slim">Upgrade to Turn on</Button>
        ) : (
          <Toggle
            isOn={isEnabled}
            handleToggle={handler}
            featureName={featureName}
          />
        )}
      </InlineStack>
      <Box paddingBlockStart="2">
        <InlineStack align="space-between">
          <Text as="p" variant="bodyMd" color="subdued">
            {description}
          </Text>
        </InlineStack>
      </Box>
    </Card>
  );
}
