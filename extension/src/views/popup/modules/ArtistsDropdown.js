import React, { useCallback, useEffect, useMemo, useState } from "react";
import SearchInput, { SearchInputDeco } from "../components/SearchInput";
import { background } from "../util";
import { useStatusUpdate } from "./StatusProvider";
import { StatusTypes } from "../../../utils";

const ArtistsDropdown = ({
  createable = false,
  extraOptions = [],
  value = [],
  onChange = (newValue) => {},
}) => {
  const updateStatus = useStatusUpdate();

  const [artists, setArtists] = useState({});

  useEffect(() => {
    (async () => {
      const result = await background("getAllArtists");
      setArtists(result);
    })();
  }, []);

  const createArtist = useCallback(
    (artistName) => {
      (async () => {
        try {
          const artist = await background("createArtist", {
            name: artistName,
          });

          setArtists({ ...artists, [artist.id]: artist });

          // add the newly created artist to the dropdown value
          onChange([...value, artist.id]);
        } catch (e) {
          console.error("failed to create artist", e);
          updateStatus(
            "Failed to create artist " + artistName,
            StatusTypes.ERROR
          );
        }
      })();
    },
    [artists, onChange, updateStatus, value]
  );

  const artistOptions = useMemo(() => {
    return Object.values(artists).map((artist) => {
      return {
        value: artist.id,
        label: artist.name,
        deco: artist.isStarred ? SearchInputDeco.STAR : null,
        backgroundColor: artist.isStarred
          ? "var(--primary)"
          : "var(--secondary)",
        color: artist.isStarred
          ? "var(--primary-text)"
          : "var(--secondary-text)",
      };
    });
  }, [artists]);

  return (
    <SearchInput
      createable={createable}
      label="Artists"
      options={[...extraOptions, ...artistOptions]}
      value={value}
      onChange={onChange}
      createOption={createArtist}
    />
  );
};

export default ArtistsDropdown;
