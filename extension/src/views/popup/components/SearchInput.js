import React, { useCallback, useMemo } from "react";
import Select from "react-select";
import Creatable, { useCreatable } from "react-select/creatable";
import { contrastingColor } from "../../../util";

export const SearchInputDeco = {
  STAR: "star",
  TAG: "tag",
};

/**
 * options: array [{ value, label, color, decoration etc }]
 * value: array of values
 */
function SearchInput({
  label = "Select...",
  options = [],
  deco = null,
  value = [],
  onChange = (value) => {},
  style = {},
  createable = false,
  createOption = (newOption) => {},
}) {
  /** add decoration to options: star or tag shaped background */
  const optionStyle = useCallback(
    (baseStyles, { data }) => {
      // no color provided, no decoration
      if (!data.backgroundColor) return { ...baseStyles };

      // stars can be a color or primary color by default
      if (deco === SearchInputDeco.STAR && data.star) {
        const color = data.backgroundColor ?? "var(--primary)";

        return {
          ...baseStyles,

          alignItems: "baseline",
          display: "flex",

          ":before": {
            color: color,
            content: '"★"',
            marginRight: 6,
            fontSize: 16,
          },
        };
      }

      // add a tag icon to option
      if (data.backgroundColor && deco === SearchInputDeco.TAG) {
        return {
          ...baseStyles,

          alignItems: "center",
          display: "flex",

          ":before": {
            backgroundColor: data.backgroundColor,
            borderRadius: "2px 5px 5px 2px",
            content: '" "',
            display: "block",
            marginRight: 8,
            height: 10,
            width: 16,
          },
        };
      }

      return { ...baseStyles };
    },
    [deco]
  );

  // TODO fix rerendering on hover
  const multiValueStyle = useCallback(
    (baseStyles, { data }) => ({
      ...baseStyles,
      backgroundColor: data.backgroundColor,
    }),
    []
  );
  const multiValueLabelStyle = useCallback(
    (baseStyles, { data }) => ({
      ...baseStyles,
      paddingLeft: "5px",
      color: data.color ?? contrastingColor(data.backgroundColor),
    }),
    []
  );
  const multiValueRemoveStyle = useCallback(
    (baseStyles, { data }) => ({
      ...baseStyles,
      color: data.color ?? contrastingColor(data.backgroundColor),
    }),
    []
  );

  const propStyle = useCallback(
    (baseStyle) => ({ ...baseStyle, ...style }),
    [style]
  );

  // react-select Select takes as a value prop option objects, not just values
  // get objects from ids
  const selectedOptions = useMemo(
    () => value.map((v) => options.find((option) => option.value === v)),
    [options, value]
  );

  const props = {
    isMulti: true,
    value: selectedOptions,
    options,
    onChange: (options) => {
      onChange(options.map((option) => option.value));
    },

    placeholder: label,
    unstyled: true,
    classNamePrefix: "searchinput",
    className: "searchinput",
    styles: {
      container: propStyle,
      control: propStyle,
      option: optionStyle,
      multiValue: multiValueStyle,
      multiValueLabel: multiValueLabelStyle,
      multiValueRemove: multiValueRemoveStyle,
    },
  };

  return createable ? (
    <Creatable
      {...props}
      onCreateOption={(newOption) => {
        createOption(newOption);
      }}
    />
  ) : (
    <Select {...props} />
  );
}

export default SearchInput;
