import React, { useCallback, useMemo, useState } from "react";

function Thumbnail({ src, maxWidth = 200, square = false }) {
  // const [width, height] = useMemo(() => {
  //   return [maxWidth, maxWidth];
  // }, [maxWidth, square]);

  return (
    <img src={src} /*width={width} height={height}*/ alt={"thumbnail"}></img>
  );
}

export default Thumbnail;
