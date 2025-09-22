import React, { useCallback, useEffect, useState } from "react";
import { background } from "../util";
import Banner from "../components/Banner";
import PlayBar from "../components/PlayBar";
import TrackInfo from "../modules/TrackInfo";
import { EMPTY_TRACK, StatusTypes } from "../../../utils";
import { useStatusUpdate } from "../modules/StatusProvider";

function Tracked({ selectedTabId }) {
  const updateStatus = useStatusUpdate();

  const [editing, setEditing] = useState(false);

  const [trackInfo, setTrackInfo] = useState(EMPTY_TRACK);
  const [editingTrackInfo, setEditingTrackInfo] = useState(EMPTY_TRACK);

  // ask background script for track info from database
  useEffect(() => {
    (async () => {
      const info = await background("getTrackInfoFromDB", {
        tabId: selectedTabId,
      });
      setTrackInfo(info);
    })();
  }, [selectedTabId]);

  // if trackInfo changes or i start/stop editing, reset editingTrackInfo
  useEffect(() => {
    setEditingTrackInfo(trackInfo);
  }, [editing, trackInfo]);

  const edit = useCallback(async () => {
    updateStatus("Editing track...");
    try {
      await background(
        "editTrack",
        editingTrackInfo,
        trackInfo.url,
        selectedTabId
      );

      updateStatus("Track edited successfully", StatusTypes.SUCCESS);
      setTrackInfo(editingTrackInfo); // set updated track info
      setEditing(false); // set editing to false
      // background will navigate to new url if it was changed
    } catch (e) {
      console.error("failed to edit track", e);
      updateStatus("Track could not be edited", StatusTypes.ERROR);
    }
  }, [editingTrackInfo, selectedTabId, trackInfo, updateStatus]);

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column" }}>
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
