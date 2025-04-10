import { ChoiceList } from "@shopify/polaris";

export function SingleChoiceList({
  label = "Visibility",
  name,
  selected,
  handleSelect,
  choices = [],
}) {
  const handleChange = (value) => handleSelect(value, name);

  return (
    <ChoiceList
      title={label}
      choices={choices}
      selected={selected}
      onChange={handleChange}
    />
  );
}
