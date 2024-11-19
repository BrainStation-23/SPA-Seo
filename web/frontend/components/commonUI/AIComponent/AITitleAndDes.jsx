import React from "react";
import { ResetIcon } from "@shopify/polaris-icons";
import { Button, Icon, Spinner, Tooltip } from "@shopify/polaris";
import TextareaField from "../TextareaField";

export default function AITitleAndDes({
  name,
  data,
  handleChange,
  onHandleSubmit,
  onHandleRefetch,
  index,
  isLoading,
  clickIndex,
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
          index={index}
        />
      </div>
      <div className="ai-seo-input-action">
        <div>
          <Tooltip content="Refetch suggestion based on current content">
            <Button outline onClick={() => onHandleRefetch(name, index)}>
              {clickIndex?.key === `${name}_${index}` &&
              clickIndex?.isRefetch &&
              isLoading ? (
                <Spinner size="small" />
              ) : (
                <Icon source={ResetIcon} tone="base" />
              )}
            </Button>
          </Tooltip>
        </div>
        <div>
          <Button primary onClick={() => onHandleSubmit(name, index)}>
            {clickIndex?.key === `${name}_${index}` &&
            clickIndex?.isSubmit &&
            isLoading ? (
              <Spinner size="small" />
            ) : (
              "Use"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
