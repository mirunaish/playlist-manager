import React from "react";
import { contrastingColor } from "../../../utils";

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
