import React, { useCallback, useEffect, useState } from "react";
import { useListener } from "../hooks";
import { background } from "../util";
import Banner from "../components/Banner";
import { MessageTypes } from "../../../consts";
import PlayBar from "../components/PlayBar";
import TrackInfo from "../modules/TrackInfo";

const emptyTrack = {
  title: "",
  artists: [],
  imageLink: "",
  url: "",
  length: 0,

  tags: [],
  rating: 0,
};

function Untracked({ selectedTabId }) {
  const [untrackedInfo, setUntrackedInfo] = useState(emptyTrack); // info from the content script

  // add listener that adds track info from content script
  useListener(MessageTypes.TRACK_INFO_FORWARD, (payload) => {
    // populate track info with received data
    setUntrackedInfo({ ...untrackedInfo, ...payload });
  });
  // listener removes itself on cleanup if not manually removed

  // get untracked info from content script
  useEffect(() => {
    // reset untracked info
    setUntrackedInfo(emptyTrack);
    // ask background script to get track info from page
    background("getUntrackedInfo", selectedTabId);
    // background will later send a message with the info which the listener will catch
  }, [selectedTabId]);

  // save untracked track to backend
  const save = useCallback(async () => {
    console.log("saving track", untrackedInfo);
    await background("add", untrackedInfo);
  }, [untrackedInfo]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Banner title="Untracked" />

      <TrackInfo
        track={untrackedInfo}
        editing={true}
        updateTrack={(newTrack) =>
          setUntrackedInfo({ ...untrackedInfo, ...newTrack })
        }
        actions={[{ title: "save", func: save }]}
        showSearch
      />

      <PlayBar totalTime={60 * 3} currentTime={44} />
    </div>
  );
}

export default Untracked;
