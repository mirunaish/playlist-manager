import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useBackground, useStatusUpdate } from "../hooks";
import ZoneBanner from "../components/ZoneBanner";
import { StatusTypes } from "../../../consts";

function Tracked({ selectedTabId }) {
  const background = useBackground();
  const updateStatus = useStatusUpdate();

  const [trackInfo, setTrackInfo] = useState({});

  // ask background script for track info from database
  useEffect(() => {
    (async () => {
      const info = await background.getTrackedInfo(selectedTabId);
      setTrackInfo(info);
    })();
  }, [background, selectedTabId]);

  const edit = useCallback(async () => {
    console.log("edit button pressed");
    updateStatus({ message: "this is a test", type: StatusTypes.SUCCESS });
    // await background.edit(trackInfo);
  }, [background, trackInfo]);

  return (
    <>
      <ZoneBanner zone={"zone"} disabled={true}></ZoneBanner>
    </>
  );
}

export default Tracked;
