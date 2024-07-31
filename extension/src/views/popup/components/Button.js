import React from "react";
import { Icon } from "../icons";

function Button({
  title = "",
  icon = null, // should be an object with icon props
  primary = true,
  onClick = () => {},
}) {
  return (
    <button className={primary ? " primary" : ""} onClick={onClick}>
      {icon && <Icon {...icon} />}
      {title}
    </button>
  );
}

export default Button;
