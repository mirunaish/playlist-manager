import React, { useCallback, useEffect, useMemo, useState } from "react";
import { background } from "../util";
import SearchInput, { SearchInputDeco } from "../components/SearchInput";
import { useStatusUpdate } from "../hooks";

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
      const result = await background("getAllTags");
      setTags(result);
    })();
  }, []);

  const createTag = useCallback(
    (tagName) => {
      (async () => {
        const { ok, tag, error } = await background("createTag", {
          name: tagName,
        });
        if (!ok) {
          updateStatus("failed to create tag: " + error);
          return;
        }

        setTags({ [tag.id]: tag, ...tags });
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
