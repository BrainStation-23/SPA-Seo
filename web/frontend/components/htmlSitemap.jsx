import React, { useEffect, useState, useCallback } from "react";
import {
  Layout,
  Box,
  Text,
  AlphaCard,
  ChoiceList,
  Form,
  Button,
  VerticalStack,
} from "@shopify/polaris";
import Switch from "./commonUI/Switch/Switch";
import { InputField } from "./commonUI/InputField";
import {
  useCreateHtmlSitemapSeo,
  useHtmlSitemapQuery,
} from "../hooks/useHtmlsitemap";
import { Spinners } from "./Spinner";

export default function HTMLSitemap() {
  const [formData, setFormData] = useState({
    category: ["hidden"],
    isActiveSitemap: false,
    limit: 0,
  });

  const handleSelectChange = (value) =>
    setFormData({ ...formData, category: value });

  const handleIsChecked = () =>
    setFormData({
      ...formData,
      isActiveSitemap: !formData?.isActiveSitemap,
    });

  const handleChange = (value) => {
    setFormData({ ...formData, limit: value });
  };
  const { data, isLoading } = useHtmlSitemapQuery({
    url: "/api/html-sitemap/info",
  });
  const { mutate: createOrUpdateHtmlSitemap, isError } =
    useCreateHtmlSitemapSeo();

  const handleSubmit = (htmlSitemap) => {
    createOrUpdateHtmlSitemap(htmlSitemap);
  };

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  return (
    <>
      {isLoading ? (
        <Spinners />
      ) : (
        <Form onSubmit={() => handleSubmit(formData)}>
          <div className="seo_score_page_title_container">
            <div className="seo_score_page_title">HTML Sitemap</div>
            <div className="">
              <Button primary submit>
                Submit
              </Button>
            </div>
          </div>
          <Box
            paddingInlineStart={"32"}
            paddingInlineEnd={"32"}
            paddingBlockStart={"4"}
          >
            <Box paddingBlockEnd={"5"}>
              <Layout>
                <Layout.Section oneThird>
                  <Box paddingBlockEnd={"4"}>
                    <Text variant="headingMd">Configuration</Text>
                  </Box>
                  <Box>
                    <Text variant="bodyMd">
                      Select category to build HTML sitemap
                    </Text>
                  </Box>
                </Layout.Section>
                <Layout.Section oneHalf>
                  <Box>
                    <AlphaCard>
                      <VerticalStack gap={"4"}>
                        <Box>
                          <Switch
                            checked={formData?.isActiveSitemap}
                            handleClick={handleIsChecked}
                          />
                          <Text variant="bodyMd">
                            Please active the sitemap
                          </Text>
                        </Box>
                        <ChoiceList
                          allowMultiple
                          title="Please select category"
                          choices={[
                            {
                              label: "Products",
                              value: "Products",
                            },
                            {
                              label: "Collections",
                              value: "Collections",
                            },
                            {
                              label: "Blogs",
                              value: "Blogs",
                            },
                            {
                              label: "Articles",
                              value: "Articles",
                            },
                            {
                              label: "Pages",
                              value: "Pages",
                            },
                          ]}
                          selected={formData?.category}
                          onChange={handleSelectChange}
                        />
                        <Box>
                          <InputField
                            value={formData?.limit}
                            onChange={handleChange}
                            label={"How many items to display?"}
                            type="number"
                            name="limit"
                            placeholder={"How many items to display?"}
                            error={""}
                          />
                        </Box>
                      </VerticalStack>
                    </AlphaCard>
                  </Box>
                </Layout.Section>
              </Layout>
            </Box>
            <Box paddingBlockEnd={"5"}>
              <Layout>
                <Layout.Section oneThird>
                  <Box paddingBlockEnd={"2"}>
                    <Text variant="headingMd">
                      HTML sitemap (For your customer)
                    </Text>
                  </Box>
                  <Box>
                    <Text variant="bodyMd">
                      Make it easy for your customers to search for categories.
                    </Text>
                  </Box>
                </Layout.Section>
                <Layout.Section oneHalf>
                  <Box>
                    <AlphaCard>
                      <Text variant="headingMd">Generated by seofy </Text>
                      <a
                        target="_blank"
                        href="https://algorithm-with-shop.myshopify.com/pages/autoketing-sitemap"
                      >
                        https://algorithm-with-shop.myshopify.com/pages/autoketing-sitemap
                      </a>
                    </AlphaCard>
                  </Box>
                </Layout.Section>
              </Layout>
            </Box>
            <Box paddingBlockEnd={"5"}>
              <Layout>
                <Layout.Section oneThird>
                  <Box paddingBlockEnd={"4"}>
                    <Text variant="headingMd">XML sitemap (For Google)</Text>
                  </Box>
                  <Box>
                    <Text variant="bodyMd">
                      Used to declare separate hypertext for Google search
                      engines.
                    </Text>
                  </Box>
                </Layout.Section>
                <Layout.Section oneHalf>
                  <Box>
                    <AlphaCard>
                      <Text variant="headingMd">Generated by Shopify</Text>
                      <a
                        target="_blank"
                        href="https://algorithm-with-shop.myshopify.com/sitemap.xml"
                      >
                        https://algorithm-with-shop.myshopify.com/sitemap.xml
                      </a>
                    </AlphaCard>
                  </Box>
                </Layout.Section>
              </Layout>
            </Box>
          </Box>
        </Form>
      )}
    </>
  );
}
