import React, { useCallback, useMemo, useEffect, useState } from "react";
import Banner from "../components/Banner";
import { useListener, useStatusUpdate } from "../hooks";
import { background } from "../util";
import List from "../modules/List";
import TrackInfo from "../modules/TrackInfo";
import PlayBar from "../components/PlayBar";
import {
  EMPTY_PLAYLIST,
  EMPTY_TRACK,
  MessageTypes,
  StatusTypes,
} from "../../../consts";

function Playlist({ selectedTabId }) {
  const updateStatus = useStatusUpdate();

  const [playlistInfo, setPlaylistInfo] = useState(EMPTY_PLAYLIST);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [editingTrackInfo, setEditingTrackInfo] = useState(EMPTY_TRACK);

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
    return playlistInfo.tracks[playingIndex] ?? EMPTY_TRACK;
  }, [playingIndex, playlistInfo]);

  // if trackInfo changes or i start/stop editing, reset editingTrackInfo
  useEffect(() => {
    setEditingTrackInfo(trackInfo);
  }, [editing, trackInfo]);

  const selectTrack = useCallback(
    (index) => {
      background("playTrack", selectedTabId, index);
    },
    [selectedTabId]
  );

  // if track changes, set new playing index
  useListener(MessageTypes.PLAYLIST_UPDATE, ({ tabId, index }) => {
    if (selectedTabId === tabId) setPlayingIndex(index);
  });

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
      // set edited track info in playlist
      const newPlaylistInfo = { ...playlistInfo };
      newPlaylistInfo.tracks[playingIndex] = editingTrackInfo;
      setPlaylistInfo(newPlaylistInfo);
      // background will navigate to new url if it was changed
    } else updateStatus("track could not be edited", StatusTypes.ERROR);
  }, [
    editingTrackInfo,
    playingIndex,
    playlistInfo,
    selectedTabId,
    trackInfo,
    updateStatus,
  ]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "stretch",
      }}
    >
      <Banner title={playlistInfo.title} theme={playlistInfo.theme} />

      <div style={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
        <div style={{ width: "50%" }}>
          <List
            playlist={playlistInfo.tracks}
            selectedTrackIndex={playingIndex}
            onTrackClick={selectTrack}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
          <TrackInfo
            big={false}
            track={editing ? editingTrackInfo : trackInfo}
            updateTrack={(newTrack) =>
              setEditingTrackInfo({ ...editingTrackInfo, ...newTrack })
            }
            showSearch={!editing}
            actions={
              editing
                ? [
                    { title: "save", primary: true, func: edit },
                    { title: "cancel", func: () => setEditing(false) },
                  ]
                : [{ title: "edit", func: () => setEditing(true) }]
            }
          />

          <PlayBar totalTime={trackInfo.duration} currentTime={0} />
        </div>
      </div>
    </div>
  );
}

export default Playlist;
