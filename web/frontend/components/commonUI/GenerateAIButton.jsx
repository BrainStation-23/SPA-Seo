import React from "react";
import { Icon } from "@shopify/polaris";
import { MagicIcon } from "@shopify/polaris-icons";

export default function GenerateAIButton({
  onClick,
  icon = MagicIcon,
  title = "Generate",
}) {
  return (
    <div className="ai-icon-container">
      <div className="ai-button-with-text" onClick={() => onClick()}>
        <Icon source={icon} color="#ffffff" />
        <span className="ai-button-generate-text">{title}</span>
      </div>
    </div>
  );
}
