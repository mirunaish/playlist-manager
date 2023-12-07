import React, { useCallback, useMemo, useState } from "react";

function Thumbnail({ src, maxWidth = 200, square = false }) {
  const [width, height] = useMemo(() => {
    return [maxWidth, square ? maxWidth : (maxWidth * 3) / 4];
  }, [maxWidth, square]);

  return (
    <img
      src={src}
      width={width.toString() + "px"}
      height={height.toString() + "px"}
      alt={"thumbnail"}
    ></img>
  );
}

export default Thumbnail;
