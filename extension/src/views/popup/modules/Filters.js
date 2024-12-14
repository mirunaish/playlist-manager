import React from "react";
import Rating from "../components/Rating";
import { BORDER_STYLE } from "../../../consts";
import ArtistsDropdown from "./ArtistsDropdown";
import TagsDropdown from "./TagsDropdown";

function Filters({ setFilters, filters = null, children = [] }) {
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
          <ArtistsDropdown
            value={filters.artists}
            onChange={(value) => setFilters({ ...filters, artists: value })}
            extraOptions
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
          <TagsDropdown
            label="Include tags"
            value={filters.includedTags}
            onChange={(value) =>
              setFilters({ ...filters, includedTags: value })
            }
            style={{ height: "100%" }}
          />
        </div>
        <div style={{ ...itemStyle, width: "47%" }}>
          <TagsDropdown
            label="Exclude tags"
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
