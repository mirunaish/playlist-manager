import React, { useEffect, useState } from "react";
import Rating from "../components/Rating";
import SearchInput from "../components/SearchInput";
import ThemesDropdown from "./ThemesDropdown";
import { background } from "../util";

function Filters({ setFilters, filters = null, children }) {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    if (artists.length > 0) return;
    (async () => {
      const result = await background("getAllArtists");
      if (result.length === 0) return;
      setArtists(result);
    })();
  }, [artists, setArtists]);

  const [tags, setTags] = useState([]);
  useEffect(() => {
    if (tags.length > 0) return;
    (async () => {
      const result = await background("getAllTags");
      if (result.length === 0) return;
      setTags(result);
    })();
  }, [tags, setTags]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <SearchInput
          label="artist"
          options={artists.map((artist) => ({
            value: artist.id,
            label: artist.name,
          }))}
          value={filters.artists}
          onChange={(value) => setFilters({ ...filters, artists: value })}
          createOption={undefined}
        />
        <Rating
          multiselect
          extended
          value={filters.rating}
          onChange={(value) => setFilters({ ...filters, rating: value })}
        />
        <ThemesDropdown
          value={filters.theme}
          onChange={(value) => setFilters({ ...filters, theme: value })}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <SearchInput
          label="include tags"
          options={tags.map((tag) => ({
            value: tag.id,
            label: tag.name,
          }))}
          value={filters.includedTags}
          onChange={(value) => setFilters({ ...filters, includedTags: value })}
        />
        <SearchInput
          label="exclude tags"
          options={tags.map((tag) => ({
            value: tag.id,
            label: tag.name,
          }))}
          value={filters.excludedTags}
          onChange={(value) => setFilters({ ...filters, excludedTags: value })}
        />
      </div>

      {/* buttons, eg save, preview, etc */}
      <div>{children}</div>
    </div>
  );
}

export default Filters;
