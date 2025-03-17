import React from "react";
import { Icon, Spinner } from "@shopify/polaris";
import { MagicIcon } from "@shopify/polaris-icons";

export default function GenerateAIButton({
  onClick,
  icon = MagicIcon,
  title = "Generate",
  isDisabled = false,
  isLoading = false,
  index,
  aiGenerateIndex,
}) {
  return (
    <div className="ai-icon-container">
      <button
        className="ai-button-with-text"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        disabled={isDisabled}
      >
        {aiGenerateIndex === index && isLoading ? (
          <Spinner size="small" />
        ) : (
          <span className="ai-button-generate-text">
            <Icon source={icon} color="#ffffff" /> {title}
          </span>
        )}
      </button>
    </div>
  );
}
