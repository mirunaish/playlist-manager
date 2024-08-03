import React from "react";
import { contrastingColor } from "../../../util";

function Tag({ title, color }) {
  return (
    <div
      className="tag"
      style={{ backgroundColor: color, color: contrastingColor(color) }}
    >
      {title}
    </div>
  );
}

export default Tag;
