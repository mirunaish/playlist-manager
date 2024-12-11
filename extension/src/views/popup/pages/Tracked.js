import React, { useCallback, useEffect, useState } from "react";
import { background } from "../util";
import Banner from "../components/Banner";
import PlayBar from "../components/PlayBar";
import TrackInfo from "../modules/TrackInfo";

function Tracked({ selectedTabId }) {
  const [editing, setEditing] = useState(false);

  const [trackInfo, setTrackInfo] = useState({
    title: "",
    artists: [],
    imageLink: "",
    url: "",
    length: 0,
    rating: 0,
    tags: [],
  });

  // ask background script for track info from database
  useEffect(() => {
    (async () => {
      const info = await background("getTrackedInfo", selectedTabId);
      setTrackInfo(info);
    })();
  }, [selectedTabId]);

  const edit = useCallback(async () => {
    console.log("edit button pressed");
    await background("edit", trackInfo);
  }, [trackInfo]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Banner theme="DARK_PINK" />

      <TrackInfo
        track={trackInfo}
        updateTrack={(newTrack) => setTrackInfo({ ...trackInfo, ...newTrack })}
        editing={editing}
        actions={
          editing
            ? [
                { title: "save", func: edit },
                { title: "cancel", func: () => setEditing(false) },
              ]
            : [{ title: "edit", func: () => setEditing(true) }]
        }
        showSearch={!editing}
      />

      <PlayBar totalTime={60 * 3} currentTime={44} />
    </div>
  );
}

export default Tracked;
