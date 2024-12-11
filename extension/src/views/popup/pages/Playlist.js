import React, { useCallback, useMemo, useEffect, useState } from "react";
import Banner from "../components/Banner";
import { useStatusUpdate } from "../hooks";
import { background } from "../util";
import List from "../modules/List";
import TrackInfo from "../modules/TrackInfo";
import PlayBar from "../components/PlayBar";
import Button from "../components/Button";

const emptyPlaylist = {
  title: "Playlist",
  theme: "DARK_PINK",

  tracks: [],
  filters: {},
};
const emptyTrack = {
  title: "",
  artists: [],
  imageLink: "",
  url: "",
  length: 0,
  tags: [],
};

function Playlist({ selectedTabId }) {
  const updateStatus = useStatusUpdate();

  const [playlistInfo, setPlaylistInfo] = useState(emptyPlaylist);
  const [playingIndex, setPlayingIndex] = useState(0);

  // editing currently playing track?
  const [editing, setEditing] = useState(false);

  // ask background script for playlist info
  // includes playlist name and theme, list, and playing track info
  useEffect(() => {
    (async () => {
      const info = await background("getPlaylistInfo", selectedTabId);
      setPlaylistInfo(info);
      setPlayingIndex(info.playingIndex);
    })();
  }, [selectedTabId]);

  const trackInfo = useMemo(() => {
    return playlistInfo.tracks[playingIndex] ?? emptyTrack;
  }, [playingIndex, playlistInfo]);

  const selectTrack = useCallback((index) => {
    background("playTrack", index);
  }, []);

  const edit = useCallback(async () => {
    console.log("edit button pressed");
    await background("edit", trackInfo);
  }, [trackInfo]);

  return (
    <>
      <Banner title={playlistInfo.title} theme={playlistInfo.theme} />

      <div style={{ display: "flex", flexDirection: "row" }}>
        <List
          playlist={playlistInfo.tracks}
          selectedTrackIndex={playingIndex}
          onTrackClick={selectTrack}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <TrackInfo track={trackInfo} showSearch={!editing} />
          {editing && (
            <>
              <Button title="save" onClick={edit} />
              <Button title="cancel" onClick={() => setEditing(false)} />
            </>
          )}
          {!editing && <Button title="edit" onClick={() => setEditing(true)} />}

          <PlayBar totalTime={trackInfo["length"]} currentTime={0} />
        </div>
      </div>
    </>
  );
}

export default Playlist;
