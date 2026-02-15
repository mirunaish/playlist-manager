import React from "react";
import { Themes, humanReadable } from "../../../utils";

function ThemesDropdown({ value = null, onChange = (id) => {} }) {
  // get themes TODO if themes are ever moved to db instead of hardcoded
  // useEffect(() => {
  //   (async () => {
  //     // TODO ask background for default theme to auto select
  //     const themes = await background(FUNCTIONS.getAllThemes);
  //     const initialThemeId = Object.keys(themes)[0]; // first theme by default

  //     setThemeId(initialThemeId);
  //   })();
  // }, []);

  return (
    <select
      value={value}
      style={{
        backgroundColor: Themes[value]?.secondary,
        color: Themes[value]?.secondaryText,
        border: "none",
      }}
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
