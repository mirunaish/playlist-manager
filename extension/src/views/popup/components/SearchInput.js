import React from "react";
import Select from "react-select";
import Creatable, { useCreatable } from "react-select/creatable";

function SearchInput({
  label,
  options,
  value = [],
  onChange = (value) => {},
  createable = false,
  createOption = (newOption) => {},
}) {
  const props = {
    // unstyled: true,
    name: label,
    options,
    onChange,
    isMulti: true,
  };

  return createable ? (
    <Creatable
      {...props}
      onCreateOption={(newOption) => {
        createOption(newOption);
        value = [...value, newOption];
      }}
    />
  ) : (
    <Select {...props} />
  );
}

export default SearchInput;
