import React, { useState } from "react";
import { InputField } from "./InputField";
import { Button } from "@shopify/polaris";

export default function Search({ setSearchTerm }) {
  const [searchInput, setSearchInput] = useState("");
  const handleChange = (value) => {
    setSearchInput(value);
  };
  const onSubmit = (searchInp) => {
    setSearchTerm(searchInp);
  };

  return (
    <div className="product__search_container">
      <InputField
        value={searchInput}
        onChange={handleChange}
        placeholder={"Search products"}
      />
      <Button primary onClick={() => onSubmit(searchInput)}>
        Search
      </Button>
      ;
    </div>
  );
}
