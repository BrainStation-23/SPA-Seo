import React, { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Box,
  Text,
  Button,
  HorizontalStack,
} from "@shopify/polaris";
import { Modal, useAppBridge } from "@shopify/app-bridge-react";
import { useUninstall } from "../hooks/useUninstall";
import { Redirect } from "@shopify/app-bridge/actions";

export default function manual() {
  const { mutate: uninstall, isLoading, isSuccess, isError } = useUninstall();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const shopify = useAppBridge();
  const redirect = Redirect.create(shopify);

  function handleCancelSubscriptionClick() {
    uninstall();
  }

  useEffect(() => {
    if (isSuccess) {
      setShowConfirmation(false);
      redirect.dispatch(
        Redirect.Action.ADMIN_PATH,
        "/settings/apps/app_installations/app/seofy-complete-seo-expert"
      );
    } else if (isError) {
    }
  }, [isLoading, isSuccess, isError]);

  return (
    <Page title="User manual">
      <Layout>
        {showConfirmation && (
          <Modal
            open={showConfirmation}
            message="Are you sure you want to remove everything ?"
            title="Remove everything"
            secondaryActions={[
              {
                content: "No",
                onAction: () => setShowConfirmation(false),
              },
            ]}
            primaryAction={{
              loading: isLoading,
              content: "Yes",
              destructive: true,
              onAction: handleCancelSubscriptionClick,
            }}
            onClose={() => setShowConfirmation(false)}
          ></Modal>
        )}
        <Layout.Section oneHalf>
          <Text variant="headingLg">Reset everything</Text>
          <Box paddingBlockStart={"1"} paddingBlockEnd={"2"}>
            <Text variant="bodyMd">
              This will remove every change that the app made in youre store,
              including theme snippets and stored settings.
            </Text>
          </Box>
          <Box></Box>
        </Layout.Section>
        <Layout.Section oneHalf>
          <HorizontalStack align="center">
            <Button destructive onClick={() => setShowConfirmation(true)}>
              Reset
            </Button>
          </HorizontalStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
