import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Icon, Icons } from "../icons";
import { Themes, changeTheme } from "../../../themes";
import { getNeighbors } from "../../../util";
import { background } from "../util";

function Banner({ title = null, theme = null, disabled = false }) {
  const [currentTheme, setCurrentTheme] = useState({ theme });

  // if theme changes, set current theme (?)
  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  // if theme was not provided, ask background for info about quickplay
  // useEffect(() => {
  //   if (currentTheme == null) {
  //     (async () => {
  //       const quickplays = await background("getAllquickplays");
  //       setquickplay(quickplays[quickplayId]);
  //     })();
  //   }
  // }, [currentTheme]);

  // set css variables to theme
  useEffect(() => {
    if (theme) changeTheme(theme);
  }, [theme]);

  return (
    <div className="banner">
      <p> {title} </p>
    </div>
  );
}

export default Banner;
