import React, { useState, useEffect } from "react";
import { Page, Layout, Box, Text, Card, Banner, List } from "@shopify/polaris";
import { AlertDiamondIcon } from "@shopify/polaris-icons";
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
      <Box paddingBlockEnd={"5"}>
        <Layout>
          <Layout.Section>
            <Card padding={"0"}>
              <Banner status="warning" title="App uninstall instructions" />
              <Box padding={"6"}>
                <Text variant="bodyMd">
                  Our app enhances your store’s SEO by adding custom code to
                  theme files, including meta tags, structured data, and image
                  alt text optimizations. By clicking here, you’ll automatically
                  remove all SEO code introduced by the app, restoring your
                  theme to its original state and keeping your store’s code
                  clean and streamlined after uninstalling.
                </Text>
                <Box paddingBlockStart={"6"}>
                  <Text variant="headingMd">Instruction</Text>
                  <Box paddingBlockStart={"2"}>
                    <List>
                      <List.Item>Click the reset Button</List.Item>
                      <List.Item>Confirm reset everything</List.Item>
                      <List.Item>Uninstall the app from app settings</List.Item>
                      <List.Item>
                        Do not go back to app home page after confirming reset.
                        (This will reapply the theme edits to your store)
                      </List.Item>
                    </List>
                  </Box>
                </Box>
              </Box>
              <Box>
                <Banner
                  status="critical"
                  title={<Text variant="headingLg">Reset everything</Text>}
                  action={{
                    content: "Reset",
                    onAction: () => setShowConfirmation(true),
                    destructive: true,
                  }}
                >
                  <Text variant="bodyMd">
                    This will remove every change that the app made in youre
                    store, including theme snippets and stored settings.
                  </Text>
                </Banner>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Box>
    </Page>
  );
}
