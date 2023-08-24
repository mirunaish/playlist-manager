import React from "react";
import { Icon } from "../icons";

function Button({ title = "", icon = {}, primary = true, onClick = () => {} }) {
  return (
    <button className={primary ? " primary" : ""} onClick={onClick}>
      {icon && <Icon {...icon} />}
      {title}
    </button>
  );
}

export default Button;
