import React, { useState, useEffect } from "react";
import {
  Layout,
  Box,
  Text,
  Card,
  BlockStack,
  TextField,
} from "@shopify/polaris";
import { useHomeSeo } from "../../contexts/home.context";

export default function SocialMediaInformation({ setHasSocialErrors }) {
  const { organization, setOrganization } = useHomeSeo();
  const [errors, setErrors] = useState({});

  const validateURL = (url) => {
    const urlPattern =
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9._-]+\.[a-zA-Z]{2,})(\/[a-zA-Z0-9._-]*)*\/?$/;
    return urlPattern.test(url);
  };

  const handleURLChange = (platform, value) => {
    setOrganization({
      ...organization,
      socialLinks: { ...organization?.socialLinks, [platform]: value },
    });

    setErrors((prevErrors) => ({
      ...prevErrors,
      [platform]: value && !validateURL(value) ? "Enter a valid URL" : null,
    }));
  };
  useEffect(() => {
    setHasSocialErrors(Object.values(errors).some((error) => error !== null));
  }, [errors, setHasSocialErrors]);
  return (
    <Box paddingBlockStart={"6"} paddingBlockEnd={"5"}>
      <Layout>
        <Layout.Section oneThird>
          <Box paddingBlockEnd={"4"}>
            <Text variant="headingMd">Social Media Profiles</Text>
          </Box>
          <Box>
            <Text variant="bodyMd">
              Let search engines like Google know you have a social media
              presence and a real company.
            </Text>
          </Box>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Box>
            <Card>
              <BlockStack gap={"4"}>
                <TextField
                  label="Facebook page URL"
                  value={organization?.socialLinks?.facebook}
                  placeholder="https://facebook.com/"
                  onChange={(value) => handleURLChange("facebook", value)}
                  error={errors.facebook}
                />
                <TextField
                  label="Twitter URL"
                  value={organization?.socialLinks?.twitter}
                  placeholder="https://twitter.com/"
                  onChange={(value) => handleURLChange("twitter", value)}
                  error={errors.twitter}
                />
                <TextField
                  label="Instagram URL"
                  value={organization?.socialLinks?.instagram}
                  placeholder="https://instagram.com/"
                  onChange={(value) => handleURLChange("instagram", value)}
                  error={errors.instagram}
                />
                <TextField
                  label="Youtube URL"
                  value={organization?.socialLinks?.youtube}
                  placeholder="https://youtube.com/channel/"
                  onChange={(value) => handleURLChange("youtube", value)}
                  error={errors.youtube}
                />
                <TextField
                  label="Pinterest URL"
                  value={organization?.socialLinks?.pinterest}
                  placeholder="https://pinterest.com/"
                  onChange={(value) => handleURLChange("pinterest", value)}
                  error={errors.pinterest}
                />
                <TextField
                  label="LinkedIn URL"
                  value={organization?.socialLinks?.linkedin}
                  placeholder="https://linkedin.com/"
                  onChange={(value) => handleURLChange("linkedin", value)}
                  error={errors.linkedin}
                />
                <TextField
                  label="Snapchat URL"
                  value={organization?.socialLinks?.snapchat}
                  placeholder="https://snapchat.com/"
                  onChange={(value) => handleURLChange("snapchat", value)}
                  error={errors.snapchat}
                />
                <TextField
                  label="TikTok URL"
                  value={organization?.socialLinks?.tiktok}
                  placeholder="https://tiktok.com/"
                  onChange={(value) => handleURLChange("tiktok", value)}
                  error={errors.tiktok}
                />
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Box>
  );
}
