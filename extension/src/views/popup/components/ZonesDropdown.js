import { useEffect, useState } from "react";
import { useBackground } from "../hooks";
import { Themes } from "../../../themes";

function ZonesDropdown({ selectedZoneId = null, setZoneId = (id) => {} }) {
  const background = useBackground();

  const [zones, setZones] = useState({});

  // ask background for zones
  useEffect(() => {
    (async () => {
      const zones = await background.getAllZones();
      setZones(zones);
    })();
  }, [background]);

  return (
    <select
      value={selectedZoneId}
      style={{ backgroundColor: Themes[zones[selectedZoneId]?.theme]?.primary }}
      onChange={(e) => setZoneId(e.target.value)}
    >
      {Object.values(zones).map((zone) => (
        <option
          key={zone.id}
          value={zone.id}
          label={zone.name}
          color={Themes[zone.theme].primary}
        />
      ))}
    </select>
  );
}

export default ZonesDropdown;
