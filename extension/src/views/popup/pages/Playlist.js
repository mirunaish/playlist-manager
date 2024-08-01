import React, { useCallback, useMemo, useEffect, useState } from "react";
import Banner from "../components/Banner";
import { useStatusUpdate } from "../hooks";
import { background } from "../util";

function Playlist({ selectedTabId }) {
  const updateStatus = useStatusUpdate();

  const [trackInfo, setTrackInfo] = useState({});

  // ask background script for track info from playlist
  useEffect(() => {
    (async () => {
      const info = await background("getPlaylistInfo", selectedTabId);
      setTrackInfo(info);
    })();
  }, [selectedTabId]);

  return (
    <>
      <Banner theme={""} disabled={true} />
    </>
  );
}

export default Playlist;
