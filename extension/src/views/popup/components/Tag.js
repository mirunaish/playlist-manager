import React from "react";
import { contrastingColor } from "../../../util";

function Tag({ name, color }) {
  return (
    <div
      className="tag"
      style={{ backgroundColor: color, color: contrastingColor(color) }}
    >
      {name}
    </div>
  );
}

export default Tag;
