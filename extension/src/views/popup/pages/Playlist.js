import React, { useCallback, useMemo, useEffect, useState } from "react";
import ZoneBanner from "../components/ZoneBanner";
import { useBackground, useStatusUpdate } from "../hooks";

function Playlist({ selectedTabId }) {
  const background = useBackground();
  const updateStatus = useStatusUpdate();

  const [trackInfo, setTrackInfo] = useState({});

  // ask background script for track info from playlist
  useEffect(() => {
    (async () => {
      const info = await background.getPlaylistInfo(selectedTabId);
      setTrackInfo(info);
    })();
  }, [background, selectedTabId]);

  return (
    <>
      <ZoneBanner zoneId={trackInfo.zoneId} disabled={true}></ZoneBanner>
    </>
  );
}

export default Playlist;
