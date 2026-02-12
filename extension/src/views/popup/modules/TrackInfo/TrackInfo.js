import React, { useEffect, useState } from "react";
import Thumbnail from "../../components/Thumbnail/Thumbnail";
import Rating from "../../components/Rating/Rating";
import Tag from "../../components/Tag/Tag";
import { background } from "../../util";
import { FUNCTIONS } from "../../../../utils";
import Button from "../../components/Button";
import ArtistsDropdown from "../ArtistsDropdown";
import TagsDropdown from "../TagsDropdown";
import SearchOtherSite from "../SearchOtherSite/SearchOtherSite";
import "./TrackInfo.scss";

function TrackInfo({
  track,
  big = true,
  showImage = true,
  editing = false,
  allowEditingUrl = true,
  updateTrack = (updated) => {},
  actions = [],
  showSearch = false,
}) {
  // construct comma-separated artist names for displaying etc
  const [artistString, setArtistString] = useState("");

  // TODO this (and some other stuff in this component) only works for tracked tracks
  // but track info is used in the untracked page too
  // and i (probably) can't just use track.artists because it might be outdated
  // unless i edit the playlists object every time i delete a tag for example
  useEffect(() => {
    if (editing || !track.id || track.id === "") return;

    (async () => {
      // get objects from ids
      const artists = await background(FUNCTIONS.getTrackArtists, track.id);
      const string = artists.map((a) => a.name).join(", "); // join them
      setArtistString(string);
    })();
  }, [editing, track]);

  // track tag labels + colors
  const [tags, setTags] = useState([]);
  useEffect(() => {
    if (editing || !track.id || track.id === "") return;

    (async () => {
      const result = await background(FUNCTIONS.getTrackTags, track.id);
      setTags(result);
    })();
  }, [editing, track]);

  return (
    <div className="track-info">
      <div className={`title-card ${big ? "big" : ""}`}>
        {showImage && (
          <Thumbnail src={track.imageLink} className="thumbnail" square />
        )}

        <div className="title-and-artist">
          {editing ? (
            <>
              <input
                value={track.title ?? ""}
                onChange={(e) => {
                  updateTrack({ title: e.target.value });
                }}
                placeholder="Title"
              />
              <ArtistsDropdown
                createable
                value={track.artists.map((a) =>
                  a.isReal === undefined
                    ? a // it's just an id
                    : {
                        // use just the name
                        // putting a special character at the start so i can more easily tell names apart from ids later...
                        value: "!" + a.name,
                        // i need to put extra data here because this isn't in the options
                        label: a.name,
                        backgroundColor: "var(--backgroundAccent)",
                        color: "var(--text)",
                      },
                )}
                onChange={(value) => {
                  // updatedValue is an array of ids for real artists and names for non real ones
                  const newValue = value.map((v) =>
                    v.startsWith("!") ? { isReal: false, name: v.slice(1) } : v,
                  );
                  updateTrack({ artists: newValue });
                }}
              />
              <Rating
                value={track.rating}
                extended={true}
                onChange={(value) => {
                  updateTrack({ rating: value });
                }}
              />
              <TagsDropdown
                long={big}
                createable
                value={track.tags}
                onChange={(value) => updateTrack({ tags: value })}
                style={{ height: "100%", flexGrow: 1 }}
              />
            </>
          ) : (
            <>
              <span className="title">{track.title}</span>
              <span className="artist">
                {(big ? "" : " - ") + artistString}
              </span>
              <Rating value={track.rating} extended disabled />
              <div className="tags">
                {tags.map(({ name, color }) => (
                  <Tag
                    key={name}
                    name={name ?? "unknown tag"}
                    color={color ?? "#9f8f9f"}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="other-info">
          <input
            disabled={!allowEditingUrl}
            placeholder="url"
            style={{ flexGrow: 1 }}
            value={track.url ?? ""}
            onChange={(e) => {
              updateTrack({ url: e.target.value });
            }}
          ></input>
          <input
            placeholder="image link"
            style={{ flexGrow: 1 }}
            value={track.imageLink ?? ""}
            onChange={(e) => {
              updateTrack({ imageLink: e.target.value });
            }}
          ></input>
          <input
            placeholder="duration in seconds"
            style={{ flexGrow: 1 }}
            value={track.duration?.toString() ?? ""}
            onChange={(e) => {
              updateTrack({ duration: e.target.value });
            }}
          ></input>
        </div>
      ) : null}

      <div className="buttons-row">
        {actions.map(({ title = null, icon = null, func, primary = false }) => (
          <Button
            primary={primary}
            key={title}
            icon={icon}
            title={title}
            onClick={func}
          />
        ))}
      </div>

      {/* search on other sites buttons */}
      {showSearch && (
        <SearchOtherSite
          artistString={track.artistString}
          title={track.title}
          url={track.url}
        />
      )}
    </div>
  );
}

export default TrackInfo;
