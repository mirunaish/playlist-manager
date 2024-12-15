import React, { useCallback, useEffect, useMemo, useState } from "react";
import Thumbnail from "../components/Thumbnail";
import Rating from "../components/Rating";
import Tag from "../components/Tag";
import { background, closePopup } from "../util";
import { SupportedSites } from "../../../consts";
import Button from "../components/Button";
import { Icons } from "../icons";
import ArtistsDropdown from "./ArtistsDropdown";
import TagsDropdown from "./TagsDropdown";

function TrackInfo({
  track,
  guessedArtists = [], // in case of untracked
  setGuessedArtists = (v) => {}, // just forward these to ArtistsDropdown
  big = true,
  editing = false,
  allowEditingUrl = true,
  updateTrack = (updated) => {},
  actions = [],
  showSearch = false,
}) {
  // comma-separated artist names
  const [artistString, setArtistString] = useState("");
  useEffect(() => {
    (async () => {
      // get objects from ids
      const artists = await background("getTrackArtists", track.artists);
      const string = artists.map((a) => a.name).join(", "); // join them
      setArtistString(string);
    })();
  }, [track]);

  // tag labels + colors
  const [tags, setTags] = useState([]);
  useEffect(() => {
    (async () => {
      const result = await background("getTrackTags", track.tags);
      setTags(result);
    })();
  }, [track]);

  const search = useCallback(
    async (site) => {
      // background will open a new tab with the search
      await background(
        "searchOtherSite",
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
                value={track.artists}
                onChange={(value) => updateTrack({ artists: value })}
                guessedValue={guessedArtists}
                setGuessedValue={setGuessedArtists}
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
