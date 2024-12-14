import React, { useEffect, useMemo, useState } from "react";
import { background } from "../util";
import SearchInput, { SearchInputDeco } from "../components/SearchInput";

const TagsDropdown = ({
  label = "Tags",
  createable = false,
  value = [],
  onChange = () => {},
  style = {},
}) => {
  const [tags, setTags] = useState({});
  useEffect(() => {
    (async () => {
      const result = await background("getAllTags");
      setTags(result);
    })();
  }, []);

  const tagOptions = useMemo(() => {
    return Object.values(tags).map((tag) => ({
      value: tag.id,
      label: tag.name,
      backgroundColor: tag.color,
    }));
  }, [tags]);

  return (
    <SearchInput
      createable={createable}
      label={label}
      options={tagOptions}
      deco={SearchInputDeco.TAG}
      value={value}
      onChange={onChange}
      style={style}
    />
  );
};

export default TagsDropdown;
