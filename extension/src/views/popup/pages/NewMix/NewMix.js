import React, { useCallback, useEffect, useState } from "react";
import Button from "../../components/Button";
import { useStatusUpdate } from "../../providers/StatusProvider";
import { background } from "../../util";
import Banner from "../../components/Banner/Banner";
import { FUNCTIONS, StatusTypes } from "../../../../utils";
import Filters from "../../modules/Filters/Filters";
import List from "../../modules/List";
import Stats from "../../modules/Stats";
import ThemesDropdown from "../../modules/ThemesDropdown";
import { Icons } from "../../icons";
import "./NewMix.scss";

/** start new custom playlist page */
function NewMix() {
  const updateStatus = useStatusUpdate();

  const [filters, setFilters] = useState({
    artists: [],
    includedTags: [],
    excludedTags: [],
    rating: [],
    sort: "shuffle",
  });
  const [mixName, setMixName] = useState("Custom Mix");
  const [theme, setTheme] = useState("DARK_PINK");

  const [playlistPreview, setPlaylistPreview] = useState(null);
  const [stats, setStats] = useState(null);

  const preview = useCallback(async () => {
    updateStatus("fetching playlist...");
    try {
      let playlist = await background(FUNCTIONS.previewPlaylist, filters);
      setPlaylistPreview(playlist);
      setStats({}); // TODO
      updateStatus("");
    } catch (e) {
      updateStatus(e.message, StatusTypes.ERROR);
    }
  }, [filters, updateStatus]);

  const play = useCallback(
    async (startIndex) => {
      updateStatus("fetching playlist...");
      try {
        await background(
          FUNCTIONS.startPlaying,
          mixName,
          theme,
          filters,
          playlistPreview,
          startIndex
        );
        updateStatus("");
      } catch (e) {
        updateStatus(e.message, StatusTypes.ERROR);
      }
    },
    [filters, mixName, playlistPreview, theme, updateStatus]
  );

  const saveMix = useCallback(async () => {
    // await background(FUNCTIONS.saveMix, filters); // TODO
  }, [filters]);

  const reshuffle = useCallback(async () => {
    const shuffled = await background(FUNCTIONS.reshuffle, playlistPreview);
    setPlaylistPreview(shuffled);
  }, [playlistPreview]);

  // reset preview playlist when filters are changed
  useEffect(() => {
    setPlaylistPreview(null);
  }, [filters]);

  return (
    <div className="page new-mix">
      <Banner title="New mix" />

      <Filters filters={filters} setFilters={setFilters}>
        {/** title and theme inputs */}
        <div className="buttons-row">
          <input
            placeholder="Mix title"
            value={mixName}
            // @ts-ignore
            onChange={(e) => setMixName(e.target.value)}
          />
          <ThemesDropdown value={theme} onChange={(value) => setTheme(value)} />
        </div>

        <div className="buttons-row">
          <Button title="Preview" onClick={preview} />
          <Button primary title="Play" onClick={() => play(0)} />
          <Button title="Save to Quickplay" onClick={saveMix} />
        </div>
      </Filters>

      {/* preview playlist */}
      {playlistPreview && stats ? (
        <div className="preview-container">
          <List
            className="half"
            playlist={playlistPreview}
            onTrackClick={(index) => play(index)}
          >
            <Button
              icon={{ icon: Icons.SHUFFLE }}
              onClick={reshuffle}
              title="shuffle"
            />
            <Button
              icon={{ icon: Icons.PIN }}
              onClick={saveMix}
              title="save mix"
            />
          </List>

          <div className="half">
            <Stats stats={stats} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NewMix;
