import React, { useCallback, useMemo } from "react";
import Select from "react-select";
import Creatable from "react-select/creatable";
import { contrastingColor } from "../../../../utils";
import "./SearchInput.scss";

export const SearchInputDeco = {
  STAR: "star",
  TAG: "tag",
  PENCIL: "pencil", // for new options?
};

/**
 * options: array [{ value, label, color, decoration etc }]
 * value: array of values or objects
 */
function SearchInput({
  label = "Select...",
  options = [],
  value = [],
  onChange = (value) => {},
  style = {},
  createable = false,
  createOption = (newOption) => {},
  long = false,
}) {
  /** add decoration to options: star or tag shaped background */
  const optionStyle = useCallback((baseStyles, { data }) => {
    // no color provided, no decoration
    if (!data.backgroundColor) return { ...baseStyles };

    // stars can be a color or primary color by default
    if (data.deco === SearchInputDeco.STAR) {
      return {
        ...baseStyles,

        alignItems: "baseline",
        display: "flex",

        ":before": {
          color: data.backgroundColor ?? "var(--primary)",
          content: '"★"',
          marginRight: 6,
          fontSize: 16,
        },
      };
    }

    // add a tag icon to option
    if (data.deco === SearchInputDeco.TAG) {
      return {
        ...baseStyles,

        alignItems: "center",
        display: "flex",

        ":before": {
          backgroundColor: data.backgroundColor ?? "var(--primary)",
          borderRadius: "2px 5px 5px 2px",
          content: '" "',
          display: "block",
          marginRight: 8,
          height: 10,
          width: 16,
        },
      };
    }

    // add pen icon to option
    if (data.deco === SearchInputDeco.PENCIL) {
      return {
        ...baseStyles,

        alignItems: "baseline",
        display: "flex",

        ":before": {
          backgroundColor: data.backgroundColor ?? "var(--secondary)",
          content: '"✎"',
          marginRight: 6,
          fontSize: 16,
        },
      };
    }

    return { ...baseStyles };
  }, []);

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
    () =>
      value.map((v) => {
        if (typeof v === "string")
          return options.find((option) => option.value === v);
        else return v;
      }),
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
    className: (long ? "long " : "") + "searchinput",
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
    <Creatable {...props} onCreateOption={createOption} />
  ) : (
    <Select {...props} />
  );
}

export default SearchInput;
