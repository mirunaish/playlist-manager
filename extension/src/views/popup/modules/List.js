import React, { useCallback, useMemo } from "react";
import { BORDER_STYLE } from "../../../consts";
import { sum } from "lodash";
import { formatTime } from "../../../util";
import Thumbnail from "../components/Thumbnail";
import Scrollable from "../components/Scrollable";
import Rating from "../components/Rating";

function ListItem({ index, track, onClick = () => {} }) {
  return (
    <div
      onClick={onClick}
      className="playlistItem"
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 15,

        borderBottom: BORDER_STYLE,
      }}
    >
      <Thumbnail src={track.imageLink} square={true} maxWidth={50} />
      <div style={{ display: "flex", flexDirection: "column", padding: 5 }}>
        <p>
          <span>{index + ". "}</span>
          <span style={{ fontWeight: "bold" }}>
            {track.artistString + " - " + track.title}
          </span>
        </p>
        <Rating value={track.rating} extended disabled />
      </div>
    </div>
  );
}

function List({
  playlist, // array of tracks
  selectedTrackIndex = null,
  onTrackClick = (trackIndex) => {},
  children = [], // buttons at bottom
}) {
  const playlistDuration = useCallback(
    (startIndex = -1) => {
      return sum(playlist.slice(startIndex + 1).map((track) => track.duration));
    },
    [playlist]
  );

  // calculate total duration of playlist
  const totalDuration = useMemo(
    () => formatTime(playlistDuration()),
    [playlistDuration]
  );
  const remainingDuration = useMemo(
    () => formatTime(playlistDuration(selectedTrackIndex)),
    [playlistDuration, selectedTrackIndex]
  );

  return (
    <div
      className="playlist"
      style={{
        borderRight: BORDER_STYLE,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* minimal stats at the top */}
      <div
        style={{
          borderBottom: BORDER_STYLE,
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div>
          {selectedTrackIndex ? selectedTrackIndex + "/" : ""}
          {Object.keys(playlist).length}
        </div>
        <div style={{ flexGrow: 1 }} />
        <div>{selectedTrackIndex ? remainingDuration : totalDuration}</div>
      </div>

      {/* playlist */}
      <div style={{ flexGrow: 1 }}>
        <Scrollable>
          {playlist.map((track, index) => {
            return (
              <ListItem
                key={track.id}
                index={index}
                track={track}
                onClick={() => onTrackClick(index)}
              />
            );
          })}
        </Scrollable>
      </div>

      {/* some buttons at the bottom */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          borderTop: BORDER_STYLE,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default List;
