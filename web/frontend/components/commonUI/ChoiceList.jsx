import { ChoiceList } from "@shopify/polaris";
import { useState, useCallback } from "react";

export function SingleChoiceList({
  label = "Visibility",
  name,
  selected,
  handleSelect,
  choices = [],
}) {
  // const [selected, setSelected] = useState(["hidden"]);

  const handleChange = useCallback((value) => handleSelect(value, name), []);

  return (
    <ChoiceList
      title={label}
      choices={choices}
      selected={selected}
      onChange={handleChange}
    />
  );
}
