import React, { useMemo } from "react";
import "./Thumbnail.scss";

const placeholderPath = "../../placeholder.png";

function Thumbnail({
  src,
  maxWidth = 200,
  square = false,
  className = "",
  style = {},
}) {
  const [width, height] = useMemo(() => {
    return [maxWidth, square ? maxWidth : (maxWidth * 3) / 4];
  }, [maxWidth, square]);

  const fullClassName = useMemo(() => "thumbnail " + className, [className]);

  return (
    <img
      src={src ?? placeholderPath}
      className={fullClassName + (src ? "" : " hue")}
      width={width.toString() + "px"}
      height={height.toString() + "px"}
      alt="thumbnail"
      onError={(e) => {
        e.target.src = placeholderPath;
        e.target.className = fullClassName + " hue";
      }} // if the image cannot be loaded, use placeholder
      style={style}
    ></img>
  );
}

export default Thumbnail;
