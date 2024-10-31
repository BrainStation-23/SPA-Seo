import React, { useState } from "react";
import {
  Box,
  Divider,
  Page,
  Layout,
  AlphaCard,
  Text,
  VerticalStack,
} from "@shopify/polaris";
import {
  IndustryInformation,
  BrandInformation,
  CompanyLogoInformation,
  ContactInformation,
  PriceRangeInformation,
  SocialMediaInformation,
  BusinessTypeInformation,
} from "./CompanyProfileUiComponents";
import { useHomeSeo } from "../contexts/home.context";
import { useCreateMetafield } from "../hooks/useMetafieldQuery";
import Switch from "./commonUI/Switch/Switch";

export default function CompanyProfile() {
  const [loading, setLoading] = useState(false);
  const { organization, setOrganization } = useHomeSeo();
  const { mutate: createMetafield } = useCreateMetafield("metafieldList");
  const [hasSocialErrors, setHasSocialErrors] = useState(false);
  const [hasIndustryErrors, setHasIndustryErrors] = useState(false);

  const handleCheckedChange = () => {
    setOrganization((prev) => ({
      ...prev,
      status: !prev.status,
    }));
  };

  const handleSave = () => {
    const industryList = organization?.industry.join(",") || "";
    if (!industryList) {
      return setHasIndustryErrors(true);
    }
    setLoading(true);
    createMetafield(
      {
        type: "organization",
        data: {
          ...organization,
          industry: industryList,
        },
        owner: "SHOP",
      },
      {
        onSuccess: () => {
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <Page
      fullWidth
      compactTitle
      divider
      title={"Company profile settings"}
      primaryAction={{
        content: "Save",
        loading: loading,
        disabled: loading || hasSocialErrors,
        onAction: handleSave,
      }}
    >
      <Box paddingInlineStart={"32"} paddingInlineEnd={"32"}>
        <BusinessTypeInformation />
        <Divider />
        <IndustryInformation
          hasIndustryErrors={hasIndustryErrors}
          setHasIndustryErrors={setHasIndustryErrors}
        />
        <Divider />
        <BrandInformation />
        <Divider />
        <CompanyLogoInformation />
        <Divider />
        <ContactInformation />
        <Divider />
        {organization?.businessType === "LocalBusiness" && (
          <>
            <PriceRangeInformation />
            <Divider />
          </>
        )}
        <SocialMediaInformation setHasSocialErrors={setHasSocialErrors} />
        <Divider />
        <Box paddingBlockStart={"5"}>
          <Layout>
            <Layout.Section oneThird>
              <Box paddingBlockEnd={"4"}>
                <Text variant="headingMd">Show or hide settings</Text>
              </Box>
              <Box>
                <Text variant="bodyMd">
                  Inject your organization information for search engines like
                  Google to crawl.
                </Text>
              </Box>
            </Layout.Section>
            <Layout.Section oneHalf>
              <Box>
                <AlphaCard>
                  <VerticalStack gap={"6"}>
                    <Text variant="bodyMd">
                      Add organization snippet in storefront.
                    </Text>
                    <VerticalStack gap={"2"}>
                      <Text variant="headingSm">Status</Text>
                      <Switch
                        checked={organization?.status}
                        handleClick={handleCheckedChange}
                      />
                    </VerticalStack>
                  </VerticalStack>
                </AlphaCard>
              </Box>
            </Layout.Section>
          </Layout>
        </Box>
      </Box>
    </Page>
  );
}
