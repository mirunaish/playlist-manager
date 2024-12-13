import React from "react";
import { Icon } from "../icons";

function Button({
  title = "",
  icon = null, // should be an object with icon props
  primary = false,
  onClick = () => {},
}) {
  return (
    <button
      className={(primary ? "primary " : "") + (title.length > 0 ? "wide" : "")}
      onClick={onClick}
    >
      {icon && (
        // if given both a title and an icon, put padding between them
        <Icon {...icon} style={title ? { marginRight: 5 } : {}} />
      )}
      {title}
    </button>
  );
}

export default Button;
