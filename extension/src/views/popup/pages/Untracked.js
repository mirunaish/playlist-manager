import React, { useCallback, useEffect, useState } from "react";
import { useListener, useStatusUpdate } from "../hooks";
import { background } from "../util";
import Banner from "../components/Banner";
import { EMPTY_TRACK, MessageTypes, StatusTypes } from "../../../consts";
import PlayBar from "../components/PlayBar";
import TrackInfo from "../modules/TrackInfo";

function Untracked({ selectedTabId, navigate }) {
  const updateStatus = useStatusUpdate();

  const [untrackedInfo, setUntrackedInfo] = useState(EMPTY_TRACK); // info from the content script

  // add listener that adds track info from content script
  useListener(MessageTypes.TRACK_INFO_FORWARD, (payload) => {
    // populate track info with received data
    setUntrackedInfo({ ...untrackedInfo, ...payload });
  });
  // listener removes itself on cleanup if not manually removed

  // get untracked info from content script
  useEffect(() => {
    // reset untracked info
    setUntrackedInfo(EMPTY_TRACK);
    // ask background script to get track info from page
    background("getUntrackedInfo", selectedTabId);
    // background will later send a message with the info which the listener will catch
  }, [selectedTabId]);

  // save untracked track to backend
  const save = useCallback(async () => {
    console.log("saving track", untrackedInfo.title);
    updateStatus("saving track...");
    const { ok, error } = await background("add", untrackedInfo);

    if (ok) {
      updateStatus("track saved", StatusTypes.SUCCESS);
      // tell popup to switch to tracked view (but same tab id)
      navigate(selectedTabId); // will get tab type etc again
    } else {
      updateStatus(`track could not be saved: ${error}`, StatusTypes.ERROR);
    }
  }, [navigate, selectedTabId, untrackedInfo, updateStatus]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Banner title="Untracked" />

      <TrackInfo
        track={untrackedInfo}
        editing={true}
        allowEditingUrl={false}
        updateTrack={(newTrack) =>
          setUntrackedInfo({ ...untrackedInfo, ...newTrack })
        }
        actions={[{ title: "save", primary: true, func: save }]}
        showSearch
      />

      <PlayBar totalTime={60 * 3} currentTime={44} />
    </div>
  );
}

export default Untracked;
