import React, { useCallback, useMemo, useEffect, useState } from "react";
import Banner from "../components/Banner/Banner";
import { useListener } from "../hooks";
import { background } from "../util";
import List from "../modules/List";
import PlayBar from "../components/PlayBar/PlayBar";
import {
  EMPTY_PLAYLIST,
  EMPTY_TRACK,
  FUNCTIONS,
  MessageTypes,
} from "../../../utils";
import Button from "../components/Button";
import { Icons } from "../icons";
import TrackInfoEditable from "../modules/TrackInfoEditable";

function Playlist({ selectedTabId }) {
  const [playlistInfo, setPlaylistInfo] = useState(EMPTY_PLAYLIST);
  const [playingIndex, setPlayingIndex] = useState(null);

  // ask background script for playlist info
  // includes playlist name and theme, list, and playing track info
  useEffect(() => {
    (async () => {
      const info = await background(
        FUNCTIONS.getPlaylistByTabId,
        selectedTabId,
      );
      setPlaylistInfo(info);
      setPlayingIndex(info.playingIndex);
    })();
  }, [selectedTabId]);

  const trackInfo = useMemo(() => {
    return playlistInfo.tracks[playingIndex] ?? EMPTY_TRACK;
  }, [playingIndex, playlistInfo]);

  const selectTrack = useCallback(
    (index) => {
      background(FUNCTIONS.playTrack, selectedTabId, index);
    },
    [selectedTabId],
  );

  // if track changes, set new playing index
  useListener(MessageTypes.PLAYLIST_UPDATE, ({ tabId, index }) => {
    if (selectedTabId === tabId) setPlayingIndex(index);
  });

  const onTrackEdit = useCallback(
    async (updatedTrack) => {
      setPlaylistInfo((prev) => {
        const newTracks = [...prev.tracks];
        newTracks[playingIndex] = updatedTrack;
        return { ...prev, tracks: newTracks };
      });
    },
    [playingIndex],
  );

  const stop = useCallback(async () => {
    await background(FUNCTIONS.stopPlaying, selectedTabId);
    // background will message me to close the tab
  }, [selectedTabId]);

  const stopAfterTrackEnds = useCallback(async () => {
    // remove all tracks after current one in playlist
    const newPlaylist = await background(
      FUNCTIONS.stopAfterTrackEnds,
      selectedTabId,
    );
    setPlaylistInfo((prev) => ({ ...prev, tracks: newPlaylist.tracks }));
  }, [selectedTabId]);

  return (
    <div
      className="page"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "stretch",
      }}
    >
      <Banner title={playlistInfo.title} theme={playlistInfo.theme} />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        <List
          style={{ width: "50%" }}
          playlist={playlistInfo.tracks}
          selectedTrackIndex={playingIndex}
          onTrackClick={selectTrack}
        >
          <Button icon={{ icon: Icons.PIN }} />
          <Button icon={{ icon: Icons.SHUFFLE }} />
          <Button icon={{ icon: Icons.FINISH }} onClick={stopAfterTrackEnds} />
          <Button icon={{ icon: Icons.STOP }} onClick={stop} />
        </List>

        <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
          <TrackInfoEditable
            big={false}
            track={trackInfo}
            onChange={onTrackEdit}
            showSearch
            tabId={selectedTabId}
            imageSize={200}
          />

          <PlayBar totalTime={trackInfo.duration} currentTime={0} />
        </div>
      </div>
    </div>
  );
}

export default Playlist;
