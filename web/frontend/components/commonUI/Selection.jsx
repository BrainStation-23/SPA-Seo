import { Select } from "@shopify/polaris";
import { useCallback } from "react";

export function Selection({ label, options, selected, handleChange, name }) {
  // const [selected, setSelected] = useState("today");

  const handleSelectChange = useCallback(
    (value) => handleChange(value, name),
    []
  );

  //   const options = [
  //     { label: "Today", value: "today" },
  //     { label: "Yesterday", value: "yesterday" },
  //     { label: "Last 7 days", value: "lastWeek" },
  //   ];

  return (
    <Select
      label={label}
      options={options}
      onChange={handleSelectChange}
      value={selected}
    />
  );
}
