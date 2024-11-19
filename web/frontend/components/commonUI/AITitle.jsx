import React from "react";

export default function AITitle({ title }) {
  return (
    <div className="ai_seo_title_container">
      <h2 className="ai_seo_title">{title || "Generate content with AI"}</h2>
    </div>
  );
}
