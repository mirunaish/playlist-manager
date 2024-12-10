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
        borderBottom: BORDER_STYLE,
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Thumbnail src={track.imageLink} square={true} />
      <div style={{ display: "flex", flexDirection: "column" }}>
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
  children = [],
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
      style={{ width: "max-content", borderRight: BORDER_STYLE }}
    >
      {/* minimal stats at the top */}
      <div style={{ display: "flex", borderBottom: BORDER_STYLE }}>
        <div style={{ float: "left" }}>
          {selectedTrackIndex ? selectedTrackIndex + "/" : ""}
          {Object.keys(playlist).length}
        </div>
        <div style={{ float: "right" }}>
          {selectedTrackIndex ? remainingDuration : totalDuration}
        </div>
      </div>

      {/* playlist */}
      <Scrollable className="playlist" itemClassName="playlistItem">
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
