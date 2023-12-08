import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Icon, Icons } from "../icons";
import { useBackground } from "../hooks";
import { Themes, changeTheme } from "../../../themes";
import { getNeighbors } from "../../../util";

function ZoneBanner({
  zoneId = null,
  title = null,
  disabled = false,
  setZoneId = () => {},
}) {
  const background = useBackground();

  const [zone, setZone] = useState({ name: title, theme: Themes.DEFAULT });
  const [neighbors, setNeighbors] = useState(null);

  // ask background for info about zone
  useEffect(() => {
    if (zoneId)
      (async () => {
        const zones = await background.getAllZones();
        setZone(zones[zoneId]);
      })();
    else setZone({ name: title, theme: Themes.DEFAULT });
  }, [background, zoneId, title]);

  // set css variables to theme
  useEffect(() => {
    if (zone) changeTheme(zone.theme);
  }, [zoneId, zone]);

  // get neighboring zones
  useEffect(() => {
    if (zoneId)
      (async () => {
        const zones = await background.getAllZones();
        const index = Object.keys(zones).indexOf(zoneId);
        if (Object.keys(zones).length <= 1) setNeighbors(null);
        else setNeighbors(getNeighbors(Object.values(zones), index));
      })();
    else setNeighbors(null);
  }, [background, zoneId]);

  const getGradient = useCallback(
    (d) => {
      if (!neighbors) return "var(--primary)";

      let gradient = "linear-gradient(to " + d + ", ";
      gradient += "var(--primary), ";
      const neighborColor = Themes[neighbors[d].theme]?.primary;
      gradient += neighborColor + ", " + neighborColor + ")";
      console.log(gradient);
      return gradient;
    },
    [neighbors]
  );

  return (
    <div className="zone">
      {!disabled &&
        neighbors &&
        [Icons.LEFT, Icons.RIGHT].map((direction, i, array) => (
          <div
            onClick={() => setZoneId(neighbors[direction].id)}
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
