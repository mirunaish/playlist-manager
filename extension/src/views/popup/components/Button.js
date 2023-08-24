import React from "react";
import { Icon } from "../icons";

function Button({
  title = "",
  icon = null,
  primary = true,
  onClick = () => {},
}) {
  return (
    <button className={primary ? " primary" : ""} onClick={onClick}>
      {icon && <Icon type={icon} size={14} className={"button-icon"} />}
      {title}
    </button>
  );
}

export default Button;
