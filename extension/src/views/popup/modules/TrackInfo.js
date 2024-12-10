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
      <Rating value={track.rating} extended disabled />

      {track.tags.map((tag) => (
        <div key={tag.id}>
          <Tag name={tag.name} color={tag.color} />
        </div>
      ))}
    </div>
  );
}

export default TrackInfo;
