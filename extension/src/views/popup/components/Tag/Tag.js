import React from "react";
import { contrastingColor } from "../../../../utils";
import "./Tag.scss";

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
