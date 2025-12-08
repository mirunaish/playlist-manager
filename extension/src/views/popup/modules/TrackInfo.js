import React, { useCallback, useEffect, useState } from "react";
import Thumbnail from "../components/Thumbnail";
import Rating from "../components/Rating";
import Tag from "../components/Tag";
import { background, closePopup } from "../util";
import { FUNCTIONS, SupportedSites } from "../../../utils";
import Button from "../components/Button";
import { Icons } from "../icons";
import ArtistsDropdown from "./ArtistsDropdown";
import TagsDropdown from "./TagsDropdown";

function TrackInfo({
  track,
  big = true,
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
    if (editing) return;

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
    if (editing) return;

    (async () => {
      const result = await background(FUNCTIONS.getTrackTags, track.id);
      setTags(result);
    })();
  }, [editing, track]);

  const search = useCallback(
    async (site) => {
      // background will open a new tab with the search
      await background(
        FUNCTIONS.searchOtherSite,
        artistString + " - " + track.title,
        site
      );
      closePopup();
    },
    [artistString, track]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        padding: 10,
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: big ? "row" : "column",
          gap: 10,
          width: "100%",
        }}
      >
        <Thumbnail
          src={track.imageLink}
          style={big ? {} : { alignSelf: "center" }}
        />

        <div
          style={{
            display: big ? "flex" : "inline",
            flexDirection: big ? "column" : undefined,
            gap: big ? 5 : undefined,
            flexGrow: 1,
          }}
        >
          {editing ? (
            <>
              <input
                value={track.title ?? ""}
                onChange={(e) => {
                  updateTrack({ title: e.target.value });
                }}
              />
              <ArtistsDropdown
                createable
                value={track.artists.map((a) =>
                  a.isReal
                    ? a.id
                    : {
                        // use just the name
                        // putting a special character at the start so i can more easily tell names apart from ids later...
                        value: "!" + a.name,
                        // i need to put extra data here because this isn't in the options
                        label: a.name,
                        backgroundColor: "var(--backgroundAccent)",
                        color: "var(--text)",
                      }
                )}
                onChange={(value) => {
                  // updatedValue is an array of ids for real artists and names for non real ones
                  const newValue = value.map((v) =>
                    v.startsWith("!")
                      ? { isReal: false, name: v.slice(1) }
                      : { isReal: true, id: v }
                  );
                  updateTrack({ artists: newValue });
                }}
              />
            </>
          ) : (
            <>
              <span style={{ fontWeight: "bold", fontSize: big ? 18 : 16 }}>
                {track.title}
              </span>
              <span style={{ fontSize: big ? 18 : 16 }}>
                {(big ? "" : " - ") + artistString}
              </span>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            justifyItems: "stretch",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Rating
              value={track.rating}
              extended={true}
              onChange={(value) => {
                updateTrack({ rating: value });
              }}
            />
            <TagsDropdown
              createable
              value={track.tags}
              onChange={(value) => updateTrack({ tags: value })}
              style={{ height: "100%", flexGrow: 1 }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
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
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "row", gap: 5 }}>
          <Rating value={track.rating} extended disabled />

          {tags.map(({ name, color }) => (
            <div key={name}>
              <Tag name={name ?? "unknown tag"} color={color ?? "#9f8f9f"} />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "row" }}>
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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <p>Search for this track on:</p>
          {/* render buttons for sites except ones this track is on */}
          {Object.entries(SupportedSites).map(([site, { regex }]) => {
            return track.url.match(regex) ? null : (
              <Button
                key={site}
                icon={{ icon: Icons[site.toUpperCase()], size: 20 }}
                onClick={() => search(site)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TrackInfo;
