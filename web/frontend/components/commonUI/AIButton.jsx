import React from "react";
import { Icon } from "@shopify/polaris";

export default function AIButton({ onClick, icon, title = "Use AI for SEO" }) {
  return (
    <div className="ai-icon-container">
      <div className="ai-icon-with-text" onClick={() => onClick()}>
        <Icon source={icon} color="#ffffff" />
        <span>{title}</span>
      </div>
    </div>
  );
}
