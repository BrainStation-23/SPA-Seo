import React from "react";
import { ResetIcon } from "@shopify/polaris-icons";
import { Button, Icon } from "@shopify/polaris";
import TextareaField from "../TextareaField";

export default function AITitleAndDes({ data, handleChange }) {
  return (
    <div className="ai-seo-title-and-des">
      <div className="ai-seo-input-text">
        <TextareaField
          value={data}
          onChange={handleChange}
          type="text"
          name="seo_ai_description"
          placeholder="Enter Meta Description"
          // error={errors?.seo_description}
          rows={"2"}
        />
      </div>
      <div className="ai-seo-input-action">
        <div>
          <Button outline>
            <Icon source={ResetIcon} tone="base" />
          </Button>
        </div>
        <div>
          <Button primary>Use</Button>
        </div>
      </div>
    </div>
  );
}
