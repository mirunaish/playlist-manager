import React, { useCallback, useEffect, useMemo, useState } from "react";
import Thumbnail from "../components/Thumbnail";
import Rating from "../components/Rating";
import Tag from "../components/Tag";
import { background, closePopup } from "../util";
import { SupportedSites } from "../../../consts";
import Button from "../components/Button";
import { Icons } from "../icons";
import SearchInput, { SearchInputDeco } from "../components/SearchInput";

function TrackInfo({
  track,
  big = true,
  editing = false,
  updateTrack = (updated) => {},
  actions = [],
  showSearch = false,
}) {
  // get all artists for artist search input
  const [artists, setArtists] = useState({});
  useEffect(() => {
    (async () => {
      const result = await background("getAllArtists");
      if (!result || result.length === 0) return;
      setArtists(result);
    })();
  }, []);

  const artistString = useMemo(() => {
    if (!artists) return "";
    return track.artists.map((id) => artists[id].name).join(", ");
  }, [track, artists]);

  // and all tags
  const [tags, setTags] = useState({});
  useEffect(() => {
    (async () => {
      const result = await background("getAllTags");
      if (!result || result.length === 0) return;
      setTags(result);
    })();
  }, []);

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
        <Thumbnail src={track.imageLink} />

        <div
          style={{
            display: "flex",
            flexDirection: big ? "column" : "row",
            gap: 5,
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
              <SearchInput
                // createable TODO
                label="Artists"
                options={Object.values(artists).map((artist) => ({
                  value: artist.id,
                  label: artist.name,
                  star: artist.isStarred,
                  backgroundColor: artist.isStarred
                    ? "var(--primary)"
                    : "var(--backgroundAccent)",
                  color: artist.isStarred
                    ? "var(--primary-text)"
                    : "var(--text)",
                }))}
                deco={SearchInputDeco.STAR}
                value={track.artists}
                onChange={(value) => {
                  updateTrack({ artists: value });
                }}
              />
            </>
          ) : (
            <>
              <span className="title" style={{ fontWeight: "bold" }}>
                {track.title}
              </span>
              <span className="artist">
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
            <SearchInput
              createable
              label="Tags"
              options={Object.values(tags).map((tag) => ({
                value: tag.id,
                label: tag.name,
                backgroundColor: tag.color,
              }))}
              deco={SearchInputDeco.TAG}
              value={track.tags}
              onChange={(value) => updateTrack({ tags: value })}
              style={{ height: "100%", flexGrow: 1 }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <input
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

          {track.tags.map((id) => (
            <div key={id}>
              <Tag name={tags[id].name} color={tags[id].color} />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "row" }}>
        {actions.map(({ title, icon, func }) => (
          <Button key={title} icon={icon} title={title} onClick={func} />
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
                icon={{ icon: Icons[site.toUpperCase()], type: Icons.FILL }}
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
