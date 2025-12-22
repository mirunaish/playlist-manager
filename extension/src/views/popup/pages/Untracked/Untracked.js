import React, { useCallback, useEffect, useState } from "react";
import { useListener } from "../../hooks";
import { useStatusUpdate } from "../../providers/StatusProvider";
import { background } from "../../util";
import Banner from "../../components/Banner/Banner";
import {
  EMPTY_TRACK,
  FUNCTIONS,
  MessageTypes,
  StatusTypes,
} from "../../../../utils";
import PlayBar from "../../components/PlayBar/PlayBar";
import TrackInfo from "../../modules/TrackInfo/TrackInfo";
import "./Untracked.scss";

function Untracked({ selectedTabId, navigate }) {
  const updateStatus = useStatusUpdate();

  const [untrackedInfo, setUntrackedInfo] = useState(EMPTY_TRACK); // info from the content script
  // untrackedInfo.artists is an array of {id, name, isReal}

  // add listener that adds track info from content script
  useListener(MessageTypes.TRACK_INFO_FORWARD, (payload) => {
    (async () => {
      // populate track info with received data
      const { artists, ...trackInfo } = payload;

      // determine which artists are real and which aren't
      const artistData = await background(FUNCTIONS.artistMatch, artists);

      setUntrackedInfo({ ...untrackedInfo, ...trackInfo, artists: artistData });
    })();
  });

  // get untracked info from content script
  useEffect(() => {
    // reset untracked info
    setUntrackedInfo(EMPTY_TRACK);
    // ask background script to get track info from page
    background(FUNCTIONS.guessTrackInfo, selectedTabId);
    // background will later send a message with the info which the listener will catch
  }, [selectedTabId]);

  // save untracked track to backend
  const save = useCallback(async () => {
    console.log("saving track", untrackedInfo.title);
    updateStatus("Saving track...");

    try {
      // first of all if there's unreal artists, create them
      const artistIds = await Promise.all(
        untrackedInfo.artists.map(async (info) => {
          if (info.isReal === undefined) return info; // it's just the id
          const newArtist = await background(FUNCTIONS.createArtist, {
            name: info.name,
          });
          return newArtist.id;
        })
      );

      await background(FUNCTIONS.createTrack, {
        ...untrackedInfo,
        artists: artistIds,
      });

      updateStatus("track saved", StatusTypes.SUCCESS);
      // tell popup to switch to tracked view (but same tab id)
      navigate(selectedTabId); // will get tab type etc again
    } catch (e) {
      console.error("failed to save track", e);
      updateStatus("Failed to save track", StatusTypes.ERROR);
    }
  }, [navigate, selectedTabId, untrackedInfo, updateStatus]);

  return (
    <div className="page untracked">
      <Banner title="New Track" />

      <TrackInfo
        track={untrackedInfo}
        updateTrack={(newTrack) =>
          setUntrackedInfo({ ...untrackedInfo, ...newTrack })
        }
        editing={true}
        allowEditingUrl={false}
        actions={[{ title: "save", primary: true, func: save }]}
        showSearch
      />

      <PlayBar totalTime={untrackedInfo.duration} currentTime={44} />
    </div>
  );
}

export default Untracked;
