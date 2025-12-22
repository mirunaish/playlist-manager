import React, { useCallback, useEffect, useMemo, useState } from "react";
import { background } from "../util";
import SearchInput, {
  SearchInputDeco,
} from "../components/SearchInput/SearchInput";
import { useStatusUpdate } from "../providers/StatusProvider";
import { FUNCTIONS, StatusTypes } from "../../../utils";

const TagsDropdown = ({
  label = "Tags",
  createable = false,
  value = [],
  onChange = (newValue) => {},
  style = {},
}) => {
  const updateStatus = useStatusUpdate();

  const [allTags, setAllTags] = useState({});
  useEffect(() => {
    (async () => {
      const result = await background(FUNCTIONS.getAllTags);
      setAllTags(result);
    })();
  }, []);

  const createTag = useCallback(
    (tagName) => {
      (async () => {
        try {
          const tag = await background(FUNCTIONS.createTag, { name: tagName });
          setAllTags({ ...allTags, [tag.id]: tag });
          onChange([...value, tag.id]);
        } catch (e) {
          console.error("failed to create tag", e);
          updateStatus(`Failed to create tag ${tagName}`, StatusTypes.ERROR);
        }
      })();
    },
    [allTags, onChange, updateStatus, value]
  );

  const tagOptions = useMemo(() => {
    return Object.values(allTags).map((tag) => ({
      value: tag.id,
      label: tag.name,
      deco: SearchInputDeco.TAG,
      backgroundColor: tag.color,
    }));
  }, [allTags]);

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
