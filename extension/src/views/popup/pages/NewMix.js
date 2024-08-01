import React, { useCallback, useMemo, useEffect, useState } from "react";
import Rating from "../components/Rating";
import Button from "../components/Button";
import { useStatusUpdate } from "../hooks";
import { background } from "../util";
import Thumbnail from "../components/Thumbnail";
import { Icons } from "../icons";
import Banner from "../components/Banner";
import { StatusTypes } from "../../../consts";

/** start new custom playlist page */
function NewMix() {
  const updateStatus = useStatusUpdate();

  const [zoneId, setZoneId] = useState(null);

  // ask background script for track info from page
  // useEffect(() => {
  //   (async () => {
  //     const info = await background.getUntrackedInfo(selectedTabId);
  //     setTrackInfo(info);
  //   })();
  // }, [background, selectedTabId]);

  // populate track info
  useEffect(() => {
    (async () => {
      // TODO ask background for default zone to auto select
      const zones = await background("getAllZones");
      const initialZoneId = Object.keys(zones)[0]; // first zone by default

      setZoneId(initialZoneId);
    })();
  }, []);

  const play = useCallback(async () => {
    console.log("play button pressed");
    updateStatus({ message: "this is a test", type: StatusTypes.SUCCESS });
    // await background("play", filters);
  }, [updateStatus]);

  return (
    <div>
      <Banner title="new mix" />

      <Button title="play" onClick={play} />
    </div>
  );
}

export default NewMix;
