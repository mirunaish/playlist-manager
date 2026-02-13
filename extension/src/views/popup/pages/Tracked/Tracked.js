import React, { useEffect, useState } from "react";
import { background } from "../../util";
import Banner from "../../components/Banner/Banner";
import PlayBar from "../../components/PlayBar/PlayBar";
import TrackInfoEditable from "../../modules/TrackInfoEditable";
import { EMPTY_TRACK, FUNCTIONS } from "../../../../utils";
import "./Tracked.scss";

function Tracked({ selectedTabId }) {
  const [trackInfo, setTrackInfo] = useState(EMPTY_TRACK);

  // ask background script for track info from database
  useEffect(() => {
    (async () => {
      const info = await background(FUNCTIONS.getTrackByTabUrl, selectedTabId);
      setTrackInfo(info);
    })();
  }, [selectedTabId]);

  return (
    <div className="page tracked">
      <Banner theme="PINK_CHAMPAGNE" />

      <TrackInfoEditable
        big
        track={trackInfo}
        showSearch
        tabId={selectedTabId}
        onChange={(newTrack) => setTrackInfo(newTrack)}
      />

      <PlayBar totalTime={trackInfo.duration} currentTime={44} />
    </div>
  );
}

export default Tracked;
