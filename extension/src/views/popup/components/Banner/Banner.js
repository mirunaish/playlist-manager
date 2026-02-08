import React, { useEffect } from "react";
import { changeTheme } from "../../../../utils";
import "./Banner.scss";

function Banner({ title = null, theme = "PINK_CHAMPAGNE", disabled = false }) {
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
