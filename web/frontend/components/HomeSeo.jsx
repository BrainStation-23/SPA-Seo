import React, { useEffect, useState } from "react";
import {
  Layout,
  Box,
  Text,
  AlphaCard,
  VerticalStack,
  Form,
  Button,
  Spinner,
  SkeletonBodyText,
} from "@shopify/polaris";
import TextareaField from "./commonUI/TextareaField";
import { useCreateHomeSeo, useHomeSEOQuery } from "../hooks/useHomeSEOQuery";

export default function HomeSeo() {
  const { data, isLoading: isHomeLoading } = useHomeSEOQuery({
    url: "/api/home/get-home-seo",
  });
  const { mutate: createOrUpdateSeo, isError, isLoading } = useCreateHomeSeo();

  const [formData, setFormData] = useState({
    seo_title: "",
    seo_description: "",
  });
  const [errors, setErrors] = useState({
    seo_title: "",
    seo_description: "",
  });

  const handleChange = (value, name) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = (value) => {
    if (!value?.seo_title) {
      return setErrors({
        ...errors,
        seo_title: `Please enter SEO title`,
      });
    } else if (value.seo_title.length > 70) {
      return setErrors({
        ...errors,
        seo_title: `SEO title must be 70 characters or fewer. Currently, it is ${value?.seo_title?.length} characters.`,
      });
    } else if (!value?.seo_description) {
      return setErrors({
        ...errors,
        seo_description: `Please enter SEO description`,
      });
    } else if (value?.seo_description.length > 160) {
      return setErrors({
        ...errors,
        seo_description: `SEO description must be 160 characters or fewer. Currently, it is ${value?.seo_description?.length} characters.`,
      });
    }

    const obj = {
      homeSeo: value,
    };
    createOrUpdateSeo(obj);
  };

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  return (
    <Form onSubmit={() => handleSubmit(formData)}>
      <div className="seo_score_page_title_container">
        <div className="seo_score_page_title">Homepage SEO</div>
        <div className="">
          <Button primary submit disabled={isLoading}>
            {isLoading ? <Spinner size="small" /> : "Submit"}
          </Button>
        </div>
      </div>
      {isHomeLoading ? (
        <SkeletonBodyText lines={20} />
      ) : (
        <Box
          paddingInlineStart={"32"}
          paddingInlineEnd={"32"}
          paddingBlockStart={"4"}
        >
          <Box paddingBlockEnd={"5"}>
            <Layout>
              <Layout.Section oneThird>
                <Box paddingBlockEnd={"4"}>
                  <Text variant="headingMd">Meta Title</Text>
                </Box>
                <Box>
                  <Text variant="bodyMd">
                    The meta title helps with SEO by including keywords that
                    improve ranking and serve as the clickable headline in
                    search results
                  </Text>
                </Box>
              </Layout.Section>
              <Layout.Section oneHalf>
                <Box>
                  <AlphaCard>
                    <VerticalStack gap={"6"}>
                      <TextareaField
                        value={formData?.seo_title}
                        onChange={handleChange}
                        type="text"
                        name="seo_title"
                        placeholder={"Enter Meta Title"}
                        label={"Enter Meta Title"}
                        error={errors?.seo_title}
                        rows={2}
                      />
                    </VerticalStack>
                  </AlphaCard>
                </Box>
              </Layout.Section>
            </Layout>
          </Box>
          <Box paddingBlockEnd={"5"}>
            <Layout>
              <Layout.Section oneThird>
                <Box paddingBlockEnd={"4"}>
                  <Text variant="headingMd">Meta Description</Text>
                </Box>
                <Box>
                  <Text variant="bodyMd">
                    The meta description provides a brief summary that
                    encourages users to click through to your site by explaining
                    what your business offers
                  </Text>
                </Box>
              </Layout.Section>
              <Layout.Section oneHalf>
                <Box>
                  <AlphaCard>
                    <VerticalStack gap={"6"}>
                      <TextareaField
                        value={formData?.seo_description}
                        onChange={handleChange}
                        label={"Enter Meta Description"}
                        type="text"
                        name="seo_description"
                        placeholder="Enter Meta Description"
                        error={errors?.seo_description}
                        rows={"3"}
                      />
                    </VerticalStack>
                  </AlphaCard>
                </Box>
              </Layout.Section>
            </Layout>
          </Box>
        </Box>
      )}
    </Form>
  );
}
