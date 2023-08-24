import React from "react";
import { Icon, Icons } from "../icons";

function ZoneBanner({
  zone,
  neighbors = {}, // left, right
  disabled = false,
  setZone = () => {},
}) {
  function getGradient(d) {
    let gradient = "linear-gradient(to " + d + ", ";
    gradient += "var(--primary), ";
    gradient += neighbors[d].color + ", " + neighbors[d].color + ")";
    console.log(gradient);
    return gradient;
  }

  return (
    <div className="zone">
      {!disabled &&
        [Icons.LEFT, Icons.RIGHT].map((direction, i, array) => (
          <div
            onClick={() => setZone(neighbors[direction].id)}
            style={{
              float: direction,
              textAlign: array[1 - i],
              backgroundImage: getGradient(direction),
            }}
          >
            <Icon icon={direction} type={Icons.STROKE} size={"20px"} />
          </div>
        ))}

      <p> {zone.name} </p>
    </div>
  );
}

export default ZoneBanner;
