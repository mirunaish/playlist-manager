import React, { useEffect, useMemo, useState } from "react";
import SearchInput, { SearchInputDeco } from "../components/SearchInput";
import { background } from "../util";

const ArtistsDropdown = ({
  createable = false,
  value = [],
  onChange = () => {},
  extraOptions = false,
}) => {
  const [artists, setArtists] = useState({});

  useEffect(() => {
    (async () => {
      const result = await background("getAllArtists");
      setArtists(result);
    })();
  }, []);

  const artistOptions = useMemo(() => {
    return Object.values(artists).map((artist) => {
      return {
        value: artist.id,
        label: artist.name,
        star: artist.isStarred,
        backgroundColor: artist.isStarred
          ? "var(--primary)"
          : "var(--backgroundAccent)",
        color: artist.isStarred ? "var(--primary-text)" : "var(--text)",
      };
    });
  }, [artists]);

  return (
    <SearchInput
      createable={createable}
      label="Artists"
      options={
        extraOptions
          ? [
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
              {
                value: "artistless",
                label: "Artistless",
                star: false,
                backgroundColor: "var(--backgroundAccent)",
                color: "var(--text)",
              },
              ...artistOptions,
            ]
          : artistOptions
      }
      deco={SearchInputDeco.STAR}
      value={value}
      onChange={onChange}
    />
  );
};

export default ArtistsDropdown;
