import React from "react";
import Rating from "../../components/Rating/Rating";
import { BORDER_STYLE, SORTS } from "../../../../utils";
import ArtistsDropdown from "../ArtistsDropdown";
import TagsDropdown from "../TagsDropdown";
import "./Filters.scss";

function Filters({ setFilters, filters = null, children = null }) {
  return (
    <div className="filters" style={{ borderBottom: BORDER_STYLE }}>
      <div className="first-row">
        <div style={{ flexGrow: 1 }}>
          <ArtistsDropdown
            value={filters.artists}
            onChange={(value) => setFilters({ ...filters, artists: value })}
            extraOptions={[
              {
                value: "artistless",
                label: "Artistless",
                backgroundColor: "var(--backgroundAccent)",
                color: "var(--text)",
              },
            ]}
          />
        </div>
        <div style={{ width: "max-content" }}>
          <Rating
            multiselect
            extended
            value={filters.rating}
            onChange={(value) => setFilters({ ...filters, rating: value })}
          />
        </div>
        <div style={{ width: "max-content" }}>
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          >
            {Object.entries(SORTS).map(([key, sort]) => {
              if (sort === SORTS.shuffle)
                return <option key={key} value={key} label={sort} />;
              else
                return (
                  <>
                    <option
                      key={`${key}:DESC`}
                      value={`${key}:DESC`}
                      label={sort}
                    />
                    <option
                      key={`${key}:ASC`}
                      value={`${key}:ASC`}
                      label={`${sort} (rev)`}
                    />
                  </>
                );
            })}
          </select>
        </div>
      </div>

      <div className="second-row">
        <div style={{ width: "50%", paddingRight: 3 }}>
          <TagsDropdown
            label="Include tags"
            value={filters.includedTags}
            onChange={(value) =>
              setFilters({ ...filters, includedTags: value })
            }
            style={{ height: "100%" }}
          />
        </div>
        <div style={{ width: "50%", paddingLeft: 3 }}>
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
      {children}
    </div>
  );
}

export default Filters;
