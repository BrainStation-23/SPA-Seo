import React, { useCallback, useState } from "react";
import { Layout, Box, Text, AlphaCard, Select, VerticalStack, TextField, Tag, Button } from "@shopify/polaris";
import { useHomeSeo } from "../../contexts/home.context";
import { useUI } from "../../contexts/ui.context";

export default function IndustryInformation() {
  const { setToggleToast } = useUI();
  const { organization, setOrganization } = useHomeSeo();
  const handleAddSelection = (value) => {
    const isExists = organization?.industry?.find((org) => org.trim().toLowerCase() === value.trim().toLowerCase());

    if (isExists) {
      return setToggleToast({
        active: true,
        message: `Item already added`,
      });
    }
    setOrganization({
      ...organization,
      industry: [...organization?.industry, value],
    });
  };

  const handleRemove = (value) => {
    const list = organization?.industry?.filter((data) => data !== value);
    setOrganization({
      ...organization,
      industry: list,
    });
  };

  const [selectOrganization, setSelectOrganization] = useState("Store");
  const [otherOrganization, setOtherOrganization] = useState("");

  const options = [
    {
      label: "Store",
      value: "Store",
    },
    { label: "Arts and Crafts", value: "Arts and Crafts" },
    { label: "Baby and Kids", value: "Baby and Kids" },
    { label: "Books, Music and Video", value: "Books, Music and Video" },
    {
      label: "Business equipment and Supplies",
      value: "Business equipment and Supplies",
    },
    { label: "Clothing", value: "Clothing" },
    { label: "Electronics", value: "electronics" },
    { label: "Food and Drink", value: "Food and Drink" },
    { label: "Hardware and Automotive", value: "Hardware and Automotive" },
    { label: "Health and Beauty", value: "Health and Beauty" },
    { label: "Home and Decor", value: "Home and Decor" },
    { label: "Jewelry and Accessories", value: "Jewelry and Accessories" },
    { label: "Outdoor and Garden", value: "Outdoor and Garden" },
    { label: "Pet supplies", value: "Pet supplies" },
    { label: "Restaurants", value: "Restaurants" },
    { label: "Services", value: "Services" },
    { label: "Sports and Recreation", value: "Sports and Recreation" },
    { label: "Toys and Games", value: "Toys and Games" },
    {
      label: "Other",
      value: "Other",
    },
  ];
  const getOptionsWithDisabled = () =>
    options.map((option) => ({
      ...option,
      disabled: organization?.industry?.some(
        (selected) => selected.trim().toLowerCase() === option.value.trim().toLowerCase()
      ),
    }));
  return (
    <Box paddingBlockStart={"5"} paddingBlockEnd={"5"}>
      <Layout>
        <Layout.Section oneThird>
          <Box paddingBlockEnd={"4"}>
            <Text variant="headingMd">Industry</Text>
          </Box>
          <Box>
            <Text variant="bodyMd">Let search engines like Google know your industry</Text>
          </Box>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Box>
            <AlphaCard>
              <VerticalStack gap={"4"}>
                <div className="d-flex d-flex-gap">
                  <div className="select_for_industry">
                    <Select
                      label="Select industry"
                      options={getOptionsWithDisabled()}
                      onChange={(value) => setSelectOrganization(value)}
                      value={selectOrganization}
                    />

                    {selectOrganization == "Other" && (
                      <TextField
                        label="Enter other industry"
                        value={otherOrganization}
                        placeholder="Enter industry"
                        onChange={(value) => setOtherOrganization(value)}
                      ></TextField>
                    )}
                  </div>
                  <div className="items_center button_for_industry_info">
                    <Button primary onClick={() => handleAddSelection(selectOrganization)}>
                      Add
                    </Button>
                  </div>
                </div>
                <div className="organization_industry_list">
                  {organization?.industry?.map((data, index) => (
                    <Tag key={index} onRemove={() => handleRemove(data)}>
                      {data}
                    </Tag>
                  ))}
                </div>
              </VerticalStack>
            </AlphaCard>
          </Box>
        </Layout.Section>
      </Layout>
    </Box>
  );
}
