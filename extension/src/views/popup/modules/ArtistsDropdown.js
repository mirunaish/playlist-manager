import React, { useCallback, useEffect, useMemo, useState } from "react";
import SearchInput, { SearchInputDeco } from "../components/SearchInput";
import { background } from "../util";

const ArtistsDropdown = ({
  createable = false,
  extraOptions = false,
  value = [],
  onChange = (newValue) => {},
  guessedValue = [], // inserted by content script. won't be saved until confirmed by user
  setGuessedValue = (newGuessedValue) => {},
}) => {
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
        const { ok, artist, error } = await background("createArtist", {
          name: artistName,
        });
        if (!ok) {
          console.error("failed to create artist", error);
          return;
        }

        setArtists({ [artist.id]: artist, ...artists });
      })();
    },
    [artists]
  );

  // guessed value is not included in options
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
      options={
        extraOptions
          ? [
              {
                value: "starred",
                label: "Starred",
                deco: SearchInputDeco.STAR,
                backgroundColor: "var(--primary)",
                color: "var(--primary-text)",
              },
              {
                value: "not starred",
                label: "Not starred",
                backgroundColor: "var(--secondary)",
                color: "var(--secondary-text)",
              },
              {
                value: "artistless",
                label: "Artistless",
                backgroundColor: "var(--backgroundAccent)",
                color: "var(--text)",
              },
              ...artistOptions,
            ]
          : artistOptions
      }
      value={[
        // guessed values are not in the options
        // so i need to give all their data here
        ...guessedValue.map((name) => ({
          value: name,
          label: name,
          backgroundColor: "var(--backgroundAccent)",
          color: "var(--text)",
        })),
        ...value,
      ]}
      onChange={(updatedValue) => {
        const newGuessedValue = updatedValue.filter((v) =>
          guessedValue.includes(v)
        );
        const newValue = updatedValue.filter((v) => !guessedValue.includes(v));
        setGuessedValue(newGuessedValue);
        onChange(newValue);
      }}
      createOption={createArtist}
    />
  );
};

export default ArtistsDropdown;
