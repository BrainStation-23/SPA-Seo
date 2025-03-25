import { Select } from "@shopify/polaris";

export function Selection({ label, options, selected, handleChange, name }) {
  const handleSelectChange = (value) => handleChange(value, name);

  return (
    <Select
      label={label}
      options={options}
      onChange={handleSelectChange}
      value={selected}
    />
  );
}
