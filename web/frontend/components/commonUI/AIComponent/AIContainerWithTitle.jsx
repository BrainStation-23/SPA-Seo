import React from "react";
import AIButton from "../AIButton";
import AITitle from "../AITitle";
import { useUI } from "../../../contexts/ui.context";
import { MagicIcon } from "@shopify/polaris-icons";

export default function AIContainerWithTitle({
  children,
  title,
  isAIButton = false,
}) {
  const { useAI, setToggleAIButton } = useUI();
  const onClickForAI = () => {
    setToggleAIButton({ active: !useAI.active, data: null });
  };
  return (
    <div className="ai-container">
      {isAIButton && <AIButton onClick={onClickForAI} icon={MagicIcon} />}
      {useAI.active && (
        <div className="ai-content-generation">
          <AITitle title={title} />
          {children}
        </div>
      )}
    </div>
  );
}
