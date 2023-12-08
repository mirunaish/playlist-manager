import React, { useCallback, useMemo, useState } from "react";

const placeholderPath = "../../placeholder.png";

function Thumbnail({ src, maxWidth = 200, square = false }) {
  const [width, height] = useMemo(() => {
    return [maxWidth, square ? maxWidth : (maxWidth * 3) / 4];
  }, [maxWidth, square]);

  return (
    <img
      // className="hue"
      src={src ?? placeholderPath}
      width={width.toString() + "px"}
      height={height.toString() + "px"}
      alt={"thumbnail"}
      onError={(e) => {
        e.target.src = placeholderPath;
      }} // if the image cannot be loaded, use placeholder
    ></img>
  );
}

export default Thumbnail;
