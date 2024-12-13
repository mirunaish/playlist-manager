import React, { useMemo } from "react";

const placeholderPath = "../../placeholder.png";

function Thumbnail({ src, maxWidth = 200, square = false, style }) {
  const [width, height] = useMemo(() => {
    return [maxWidth, square ? maxWidth : (maxWidth * 3) / 4];
  }, [maxWidth, square]);

  return (
    <img
      src={src ?? placeholderPath}
      className={src ? "" : "hue"}
      width={width.toString() + "px"}
      height={height.toString() + "px"}
      alt="thumbnail"
      onError={(e) => {
        e.target.src = placeholderPath;
        e.target.className = "hue";
      }} // if the image cannot be loaded, use placeholder
      style={style}
    ></img>
  );
}

export default Thumbnail;
