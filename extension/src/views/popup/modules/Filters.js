import React, { useEffect, useState } from "react";
import Rating from "../components/Rating";
import SearchInput, { SearchInputDeco } from "../components/SearchInput";
import { background } from "../util";
import { BORDER_STYLE } from "../../../consts";

function Filters({ setFilters, filters = null, children = [] }) {
  const [artists, setArtists] = useState({});

  useEffect(() => {
    (async () => {
      const result = await background("getAllArtists");
      if (!result || result.length === 0) return;
      setArtists(result);
    })();
  }, []);

  const [tags, setTags] = useState({});
  useEffect(() => {
    (async () => {
      const result = await background("getAllTags");
      if (!result || result.length === 0) return;
      setTags(result);
    })();
  }, []);

  const itemStyle = {
    padding: "4px",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        alignItems: "center",
        borderBottom: BORDER_STYLE,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
        }}
      >
        <div style={{ ...itemStyle, flexGrow: 1 }}>
          <SearchInput
            label="Artists"
            options={[
              {
                value: "starred",
                label: "Starred",
                star: true,
                backgroundColor: "var(--primary)",
                color: "var(--primary-text)",
              },
              {
                value: "not starred",
                label: "Not starred",
                star: false,
                backgroundColor: "var(--backgroundAccent)",
                color: "var(--text)",
              },
              ...Object.values(artists).map((artist) => ({
                value: artist.id,
                label: artist.name,
                star: artist.isStarred,
                backgroundColor: artist.isStarred
                  ? "var(--primary)"
                  : "var(--backgroundAccent)",
                color: artist.isStarred ? "var(--primary-text)" : "var(--text)",
              })),
            ]}
            deco={SearchInputDeco.STAR}
            value={filters.artists}
            onChange={(value) => setFilters({ ...filters, artists: value })}
          />
        </div>
        <div style={{ ...itemStyle, width: "max-content" }}>
          <Rating
            multiselect
            extended
            value={filters.rating}
            onChange={(value) => setFilters({ ...filters, rating: value })}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          alignItems: "stretch",
        }}
      >
        <div style={{ ...itemStyle, width: "47%" }}>
          <SearchInput
            label="Include tags"
            options={Object.values(tags).map((tag) => ({
              value: tag.id,
              label: tag.name,
              backgroundColor: tag.color,
            }))}
            deco={SearchInputDeco.TAG}
            value={filters.includedTags}
            onChange={(value) =>
              setFilters({ ...filters, includedTags: value })
            }
            style={{ height: "100%" }}
          />
        </div>
        <div style={{ ...itemStyle, width: "47%" }}>
          <SearchInput
            label="Exclude tags"
            options={Object.values(tags).map((tag) => ({
              value: tag.id,
              label: tag.name,
              backgroundColor: tag.color,
            }))}
            deco={SearchInputDeco.TAG}
            value={filters.excludedTags}
            onChange={(value) =>
              setFilters({ ...filters, excludedTags: value })
            }
            style={{ height: "100%" }}
          />
        </div>
      </div>

      {/* buttons, eg save, preview, etc */}
      <div>{children}</div>
    </div>
  );
}

export default Filters;
