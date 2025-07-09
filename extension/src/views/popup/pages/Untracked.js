import React, { useCallback, useEffect, useState } from "react";
import { useListener } from "../hooks";
import { useStatusUpdate } from "../modules/StatusProvider";
import { background } from "../util";
import Banner from "../components/Banner";
import { EMPTY_TRACK, MessageTypes, StatusTypes } from "../../../consts";
import PlayBar from "../components/PlayBar";
import TrackInfo from "../modules/TrackInfo";

function Untracked({ selectedTabId, navigate }) {
  const updateStatus = useStatusUpdate();

  const [guessedArtists, setGuessedArtists] = useState([]); // artists guessed by content script
  const [untrackedInfo, setUntrackedInfo] = useState(EMPTY_TRACK); // info from the content script

  // add listener that adds track info from content script
  useListener(MessageTypes.TRACK_INFO_FORWARD, (payload) => {
    (async () => {
      // populate track info with received data
      const { artists, ...trackInfo } = payload;

      // determine which artists are real and which aren't
      const real = [];
      const notReal = [];
      for (const artistName of artists) {
        const artist = await background("getArtistByName", artistName);
        if (artist) real.push(artist.id);
        else notReal.push(artistName);
      }

      setUntrackedInfo({ ...untrackedInfo, ...trackInfo, artists: real });
      setGuessedArtists(notReal);
    })();
  });

  // get untracked info from content script
  useEffect(() => {
    // reset untracked info
    setUntrackedInfo(EMPTY_TRACK);
    setGuessedArtists([]);
    // ask background script to get track info from page
    background("getUntrackedInfo", selectedTabId);
    // background will later send a message with the info which the listener will catch
  }, [selectedTabId]);

  // save untracked track to backend
  const save = useCallback(async () => {
    console.log("saving track", untrackedInfo.title);
    updateStatus("saving track...");

    // create guessed artists if any
    const artistIds = [];
    for (const artistName of guessedArtists) {
      const { ok, artist, error } = await background("createArtist", {
        name: artistName,
      });
      if (!ok) {
        updateStatus(`failed to create artist: ${error}`, StatusTypes.ERROR);
        return;
      }
      artistIds.push(artist.id);
    }

    const { ok, error } = await background("createTrack", {
      ...untrackedInfo,
      artists: [...untrackedInfo.artists, ...artistIds],
    });

    if (!ok) {
      updateStatus(`track could not be saved: ${error}`, StatusTypes.ERROR);
      return;
    }

    updateStatus("track saved", StatusTypes.SUCCESS);
    // tell popup to switch to tracked view (but same tab id)
    navigate(selectedTabId); // will get tab type etc again
  }, [guessedArtists, navigate, selectedTabId, untrackedInfo, updateStatus]);

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column" }}>
      <Banner title="Untracked" />

      <TrackInfo
        track={untrackedInfo}
        updateTrack={(newTrack) =>
          setUntrackedInfo({ ...untrackedInfo, ...newTrack })
        }
        guessedArtists={guessedArtists}
        setGuessedArtists={setGuessedArtists}
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
