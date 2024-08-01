import React from "react";
import { Themes } from "../../../themes";
import { humanReadable } from "../../../util";

function ThemesDropdown({ value = null, onChange = (id) => {} }) {
  return (
    <select
      value={value}
      style={{ backgroundColor: Themes[value]?.primary }}
      onChange={(e) => onChange(e.target.value)}
    >
      {Object.entries(Themes).map(([themeId, theme]) => (
        <option
          key={themeId}
          value={themeId}
          label={humanReadable(themeId)}
          color={theme.primary}
        />
      ))}
    </select>
  );
}

export default ThemesDropdown;
