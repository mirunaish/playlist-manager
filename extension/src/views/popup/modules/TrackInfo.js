import React from "react";
import Thumbnail from "../components/Thumbnail";
import Rating from "../components/Rating";
import Tag from "../components/Tag";

function TrackInfo({ track, big = true }) {
  return (
    <div>
      <Thumbnail src={track.imageLink} />
      <p style={{ fontWeight: "bold" }}>{track.title}</p>
      <p style={{ fontWeight: "bold" }}>{track.artistString}</p>
      <Rating value={track.rating} />

      {track.tags.map((tag) => (
        <Tag title={tag.title} color={tag.color} />
      ))}
    </div>
  );
}

export default TrackInfo;
