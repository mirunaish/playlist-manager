import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BORDER_STYLE } from "../../../consts";
import { formatTime } from "../../../util";
import Thumbnail from "../components/Thumbnail";
import Scrollable from "../components/Scrollable";
import Rating from "../components/Rating";
import { background } from "../util";

function ListItem({
  index,
  selected,
  track,
  artistString,
  onClick = () => {},
}) {
  return (
    <div
      onClick={onClick}
      className={"playlistItem " + (selected ? "selected" : "")}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "stretch",
        gap: 10,

        borderBottom: BORDER_STYLE,
      }}
    >
      <Thumbnail src={track.imageLink} square={true} maxWidth={50} />
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          padding: 5,
          gap: 3,
        }}
      >
        <p>
          <span style={{ color: "var(--textFineprint)" }}>
            {index + 1 + ". "}
          </span>
          <span style={{ fontWeight: "bold" }}>{track.title}</span>
        </p>
        <p>{artistString}</p>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Rating value={track.rating} extended disabled size={15} />
          <p className="fineprint">{formatTime(track.duration)}</p>
        </div>
      </div>
    </div>
  );
}

function List({
  playlist, // array of tracks
  selectedTrackIndex = null,
  onTrackClick = (trackIndex) => {},
  children = [], // buttons at bottom
  style = {},
}) {
  // get all artists for track artist names
  const [artists, setArtists] = useState({});
  useEffect(() => {
    (async () => {
      const result = await background("getAllArtists");
      if (!result || result.length === 0) return;
      setArtists(result);
    })();
  }, []);

  const artistString = useCallback(
    (track) => {
      if (!artists) return "";
      return track.artists.map((id) => artists[id]?.name ?? "").join(", ");
    },
    [artists]
  );

  const playlistDuration = useCallback(
    (startIndex) => {
      return playlist
        .slice(startIndex)
        .map((track) => track.duration)
        .reduce((acc, val) => acc + val, 0); // sum all durations
    },
    [playlist]
  );

  // calculate total duration of playlist
  const totalDuration = useMemo(
    () => formatTime(playlistDuration(0)),
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
        ...style,
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
          padding: "5px 5px 0px 5px",
          justifyContent: "space-between",
        }}
      >
        <div>
          {selectedTrackIndex !== null ? selectedTrackIndex + 1 + " / " : ""}
          {Object.keys(playlist).length}
          {selectedTrackIndex !== null ? "" : " tracks"}
        </div>
        <div>
          {selectedTrackIndex !== null ? remainingDuration : totalDuration}
        </div>
      </div>

      {/* playlist */}
      <Scrollable style={{ flexGrow: 1 }}>
        {playlist.map((track, index) => {
          return (
            <ListItem
              key={track.id}
              index={index}
              selected={index === selectedTrackIndex}
              track={track}
              artistString={artistString(track)}
              onClick={() => onTrackClick(index)}
            />
          );
        })}
      </Scrollable>

      {/* some buttons at the bottom */}
      {children && children.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            borderTop: BORDER_STYLE,
            padding: "3px 5px 5px 5px",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default List;
