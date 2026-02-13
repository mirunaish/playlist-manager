import React, { useMemo } from "react";
import { Icon } from "../icons";

function Button({
  title = "",
  icon = null, // should be an object with icon props
  primary = false,
  onClick = () => {},
  className = "",
  style = {},
}) {
  const iconDetails = useMemo(() => {
    if (!icon) return {};
    if (typeof icon === "object") return icon;
    return { icon };
  }, [icon]);

  return (
    <button
      className={
        (primary ? "primary " : "") +
        (title.length > 0 ? "wide " : "") +
        className
      }
      onClick={onClick}
      style={style}
    >
      {icon && (
        // if given both a title and an icon, put padding between them
        <Icon
          {...iconDetails}
          className={icon.className + " disabled"}
          style={{ ...icon.style, ...(title ? { marginRight: 5 } : {}) }}
        />
      )}
      {title}
    </button>
  );
}

export default Button;
