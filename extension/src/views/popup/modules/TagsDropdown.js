import React, { useCallback, useEffect, useMemo, useState } from "react";
import { background } from "../util";
import SearchInput, { SearchInputDeco } from "../components/SearchInput";
import { useStatusUpdate } from "./StatusProvider";
import { FUNCTIONS, StatusTypes } from "../../../utils";

const TagsDropdown = ({
  label = "Tags",
  createable = false,
  value = [],
  onChange = () => {},
  style = {},
}) => {
  const updateStatus = useStatusUpdate();

  const [tags, setTags] = useState({});
  useEffect(() => {
    (async () => {
      const result = await background(FUNCTIONS.getAllTags);
      setTags(result);
    })();
  }, []);

  const createTag = useCallback(
    (tagName) => {
      (async () => {
        try {
          const tag = await background(FUNCTIONS.createTag, { name: tagName });
          setTags({ ...tags, [tag.id]: tag });
        } catch (e) {
          console.error("failed to create tag", e);
          updateStatus(`Failed to create tag ${tagName}`, StatusTypes.ERROR);
        }
      })();
    },
    [tags, updateStatus]
  );

  const tagOptions = useMemo(() => {
    return Object.values(tags).map((tag) => ({
      value: tag.id,
      label: tag.name,
      deco: SearchInputDeco.TAG,
      backgroundColor: tag.color,
    }));
  }, [tags]);

  return (
    <SearchInput
      createable={createable}
      label={label}
      options={tagOptions}
      value={value}
      onChange={onChange}
      style={style}
      createOption={createTag}
    />
  );
};

export default TagsDropdown;
