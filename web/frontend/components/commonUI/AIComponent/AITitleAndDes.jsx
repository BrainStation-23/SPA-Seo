import React from "react";
import { ResetIcon } from "@shopify/polaris-icons";
import { Button, Icon } from "@shopify/polaris";
import TextareaField from "../TextareaField";

export default function AITitleAndDes({
  name,
  data,
  handleChange,
  onHandleSubmit,
  onHandleRefetch,
}) {
  return (
    <div className="ai-seo-title-and-des">
      <div className="ai-seo-input-text">
        <TextareaField
          value={data}
          onChange={handleChange}
          type="text"
          name={name}
          placeholder="Enter Meta Description"
          // error={errors?.seo_description}
          rows={"2"}
        />
      </div>
      <div className="ai-seo-input-action">
        <div>
          <Button outline onClick={() => onHandleRefetch}>
            <Icon source={ResetIcon} tone="base" />
          </Button>
        </div>
        <div>
          <Button primary onClick={() => onHandleSubmit()}>
            Use
          </Button>
        </div>
      </div>
    </div>
  );
}
