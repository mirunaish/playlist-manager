import React, { useEffect } from "react";
import { changeTheme } from "../../../themes";

function Banner({ title = null, theme = "DARK_PINK", disabled = false }) {
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
