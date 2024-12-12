import React, { useCallback, useEffect, useState } from "react";
import { background } from "../util";
import Banner from "../components/Banner";
import PlayBar from "../components/PlayBar";
import TrackInfo from "../modules/TrackInfo";
import { EMPTY_TRACK, StatusTypes } from "../../../consts";
import { useStatusUpdate } from "../hooks";

function Tracked({ selectedTabId }) {
  const updateStatus = useStatusUpdate();

  const [editing, setEditing] = useState(false);

  const [trackInfo, setTrackInfo] = useState(EMPTY_TRACK);
  const [editingTrackInfo, setEditingTrackInfo] = useState(EMPTY_TRACK);

  // ask background script for track info from database
  useEffect(() => {
    (async () => {
      const info = await background("getTrackedInfo", { tabId: selectedTabId });
      setTrackInfo(info);
    })();
  }, [selectedTabId]);

  // if trackInfo changes or i start/stop editing, reset editingTrackInfo
  useEffect(() => {
    setEditingTrackInfo(trackInfo);
  }, [editing, trackInfo]);

  const edit = useCallback(async () => {
    updateStatus("editing track...");
    const ok = await background(
      "edit",
      trackInfo.url,
      editingTrackInfo,
      selectedTabId
    );
    if (ok) {
      updateStatus("track edited", StatusTypes.SUCCESS);
      setTrackInfo(editingTrackInfo); // set updated track info
      // background will navigate to new url if it was changed
    } else updateStatus("track could not be edited", StatusTypes.ERROR);
  }, [editingTrackInfo, selectedTabId, trackInfo, updateStatus]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Banner theme="DARK_PINK" />

      <TrackInfo
        track={editing ? editingTrackInfo : trackInfo}
        updateTrack={(newTrack) =>
          setEditingTrackInfo({ ...editingTrackInfo, ...newTrack })
        }
        editing={editing}
        actions={
          editing
            ? [
                { title: "save", primary: true, func: edit },
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
