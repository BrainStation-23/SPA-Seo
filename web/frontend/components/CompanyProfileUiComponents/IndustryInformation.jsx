import React, { useEffect, useState } from "react";
import {
  Layout,
  Box,
  Text,
  Card,
  Select,
  BlockStack,
  TextField,
  Tag,
  Button,
} from "@shopify/polaris";
import { useHomeSeo } from "../../contexts/home.context";
import { useUI } from "../../contexts/ui.context";

export default function IndustryInformation({
  hasIndustryErrors,
  setHasIndustryErrors,
}) {
  const { setToggleToast } = useUI();
  const { organization, setOrganization } = useHomeSeo();

  const [selectedIndustry, setSelectedIndustry] = useState("Store");
  const [otherIndustry, setOtherIndustry] = useState("");

  const options = [
    { label: "Store", value: "Store" },
    { label: "Arts and Crafts", value: "Arts and Crafts" },
    { label: "Baby and Kids", value: "Baby and Kids" },
    { label: "Books, Music and Video", value: "Books, Music and Video" },
    {
      label: "Business equipment and Supplies",
      value: "Business equipment and Supplies",
    },
    { label: "Clothing", value: "Clothing" },
    { label: "Electronics", value: "Electronics" },
    { label: "Food and Drink", value: "Food and Drink" },
    { label: "Hardware and Automotive", value: "Hardware and Automotive" },
    { label: "Health and Beauty", value: "Health and Beauty" },
    { label: "Home and Decor", value: "Home and Decor" },
    { label: "Jewelry and Accessories", value: "Jewelry and Accessories" },
    { label: "Outdoor and Garden", value: "Outdoor and Garden" },
    { label: "Pet Supplies", value: "Pet Supplies" },
    { label: "Restaurants", value: "Restaurants" },
    { label: "Services", value: "Services" },
    { label: "Sports and Recreation", value: "Sports and Recreation" },
    { label: "Toys and Games", value: "Toys and Games" },
    { label: "Other", value: "Other" },
  ];

  const getOptionsWithDisabled = () =>
    options.map((option) => ({
      ...option,
      disabled: organization?.industry?.some(
        (selected) =>
          selected.trim().toLowerCase() === option.value.trim().toLowerCase()
      ),
    }));

  const handleAddSelection = () => {
    setHasIndustryErrors(false);
    const valueToAdd =
      selectedIndustry === "Other" ? otherIndustry : selectedIndustry;
    const isExists = organization?.industry?.some(
      (org) => org.trim().toLowerCase() === valueToAdd.trim().toLowerCase()
    );

    if (isExists) {
      return setToggleToast({
        active: true,
        message: `Item already added`,
      });
    }

    if (valueToAdd) {
      setOrganization({
        ...organization,
        industry: [...(organization?.industry || []), valueToAdd],
      });
      if (selectedIndustry === "Other") setOtherIndustry("");
    }
  };

  const handleRemove = (value) => {
    const list = organization?.industry?.filter((data) => data !== value);
    setOrganization({
      ...organization,
      industry: list,
    });
  };

  return (
    <Box paddingBlockStart={"5"} paddingBlockEnd={"5"}>
      <Layout>
        <Layout.Section oneThird>
          <Box paddingBlockEnd={"4"}>
            <Text variant="headingMd">Industry</Text>
          </Box>
          <Box>
            <Text variant="bodyMd">
              Let search engines like Google know your industry
            </Text>
          </Box>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Box>
            <Card>
              <BlockStack gap={"4"}>
                <div className="d-flex d-flex-gap">
                  <div className="select_for_industry">
                    <Select
                      label="Select industry"
                      options={getOptionsWithDisabled()}
                      onChange={(value) => setSelectedIndustry(value)}
                      value={selectedIndustry}
                      error={
                        hasIndustryErrors && "Please select a specific industry"
                      }
                    />

                    {selectedIndustry === "Other" && (
                      <TextField
                        label="Enter other industry"
                        value={otherIndustry}
                        placeholder="Enter industry"
                        onChange={(value) => setOtherIndustry(value)}
                      />
                    )}
                  </div>
                  <div className="items_center button_for_industry_info">
                    <Button primary onClick={handleAddSelection}>
                      Add
                    </Button>
                  </div>
                </div>
                <div className="organization_industry_list">
                  {organization?.industry?.map(
                    (data, index) =>
                      data != "" && (
                        <Tag key={index} onRemove={() => handleRemove(data)}>
                          {data}
                        </Tag>
                      )
                  )}
                </div>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Box>
  );
}
