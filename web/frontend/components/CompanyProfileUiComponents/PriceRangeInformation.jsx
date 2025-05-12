import React, { useCallback, useState } from "react";
import {
  Layout,
  Box,
  Text,
  Card,
  BlockStack,
  TextField,
  RangeSlider,
  LegacyStack,
} from "@shopify/polaris";
import { useHomeSeo } from "../../contexts/home.context";

export default function PriceRangeInformation() {
  const initialValue = [500, 1500];
  const prefix = "$";
  const min = 0;
  const max = 2000;
  const step = 100;

  const { organization, setOrganization } = useHomeSeo();
  const [intermediateTextFieldValue, setIntermediateTextFieldValue] = useState(
    organization.priceRange
  );

  const handleRangeSliderChange = (value) => {
    setOrganization({ ...organization, priceRange: value });
    setIntermediateTextFieldValue(value);
  };

  const handleLowerTextFieldChange = useCallback(
    (value) => {
      const upperValue = organization.priceRange[1];
      setIntermediateTextFieldValue([parseInt(value, 10), upperValue]);
    },
    [organization.priceRange]
  );

  const handleUpperTextFieldChange = useCallback(
    (value) => {
      const lowerValue = organization.priceRange[0];
      setIntermediateTextFieldValue([lowerValue, parseInt(value, 10)]);
    },
    [organization.priceRange]
  );

  const handleLowerTextFieldBlur = () => {
    const upperValue = organization.priceRange[1];
    const value = intermediateTextFieldValue[0];

    setOrganization({ ...organization, priceRange: [value, upperValue] });
  };

  const handleUpperTextFieldBlur = () => {
    const lowerValue = organization.priceRange[0];
    const value = intermediateTextFieldValue[1];

    setOrganization({ ...organization, priceRange: [lowerValue, value] });
  };

  const handleEnterKeyPress = (event) => {
    const newValue = intermediateTextFieldValue;
    const oldValue = organization.priceRange;

    if (event.key === "Enter" && newValue !== oldValue) {
      setOrganization({ ...organization, priceRange: newValue });
    }
  };

  const lowerTextFieldValue =
    intermediateTextFieldValue[0] === organization.priceRange[0]
      ? organization.priceRange[0]
      : intermediateTextFieldValue[0];

  const upperTextFieldValue =
    intermediateTextFieldValue[1] === organization.priceRange[1]
      ? organization.priceRange[1]
      : intermediateTextFieldValue[1];

  return (
    <Box paddingBlockStart={"6"} paddingBlockEnd={"5"}>
      <Layout>
        <Layout.Section oneThird>
          <Box paddingBlockEnd={"4"}>
            <Text variant="headingMd">Price Range</Text>
          </Box>
          <Box>
            <Text variant="bodyMd">
              Get better search placement by letting Google know the price range
              for your store.
            </Text>
          </Box>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Box>
            <Card>
              <BlockStack gap={"4"}>
                <Text variant="headingSm">Price range for your store:</Text>
                <div onKeyDown={handleEnterKeyPress}>
                  <RangeSlider
                    output
                    value={organization?.priceRange}
                    prefix={prefix}
                    min={min}
                    max={max}
                    step={step}
                    onChange={handleRangeSliderChange}
                  />
                  <LegacyStack distribution="equalSpacing" spacing="extraLoose">
                    <TextField
                      label="Min"
                      type="number"
                      value={`${lowerTextFieldValue}`}
                      prefix={prefix}
                      min={min}
                      max={max}
                      step={step}
                      onChange={handleLowerTextFieldChange}
                      onBlur={handleLowerTextFieldBlur}
                      autoComplete="off"
                    />
                    <TextField
                      label="Max"
                      type="number"
                      value={`${upperTextFieldValue}`}
                      prefix={prefix}
                      min={min}
                      max={max}
                      step={step}
                      onChange={handleUpperTextFieldChange}
                      onBlur={handleUpperTextFieldBlur}
                      autoComplete="off"
                    />
                  </LegacyStack>
                </div>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Box>
  );
}
