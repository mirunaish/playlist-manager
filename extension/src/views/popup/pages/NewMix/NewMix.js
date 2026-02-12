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
import TrackInfoEditable from "../../modules/TrackInfoEditable";

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
  const [theme, setTheme] = useState("PINK_CHAMPAGNE");

  const [playlistPreview, setPlaylistPreview] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const preview = useCallback(async () => {
    updateStatus("fetching playlist...");
    try {
      setSelectedIndex(null);

      let playlist = await background(FUNCTIONS.previewPlaylist, filters);
      setPlaylistPreview(playlist);
      setStats({}); // TODO
      updateStatus("");
    } catch (e) {
      updateStatus(e.message, StatusTypes.ERROR);
    }
  }, [filters, updateStatus]);

  const onTrackEdit = useCallback(
    (newTrack, index) => {
      // set edited track info in playlist
      const newPlaylistInfo = [...playlistPreview];
      newPlaylistInfo[index] = newTrack;
      setPlaylistPreview(newPlaylistInfo);
    },
    [playlistPreview],
  );

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
          startIndex,
        );
        updateStatus("");
      } catch (e) {
        updateStatus(e.message, StatusTypes.ERROR);
      }
    },
    [filters, mixName, playlistPreview, theme, updateStatus],
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
    setStats(null);
    setSelectedIndex(null);
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
            onTrackClick={(index) =>
              index === selectedIndex ? play(index) : setSelectedIndex(index)
            }
            selectedTrackIndex={selectedIndex}
          >
            <Button icon={{ icon: Icons.SHUFFLE }} onClick={reshuffle} />
            <Button icon={{ icon: Icons.PIN }} onClick={saveMix} />
          </List>

          <div className="half">
            {playlistPreview === null ? null : selectedIndex === null ? (
              <Stats stats={stats} />
            ) : (
              <TrackInfoEditable
                big={false}
                showImage={false}
                allowEditingUrl={true}
                track={playlistPreview[selectedIndex]}
                actions={[{ title: "play", func: () => play(selectedIndex) }]}
                onChange={(newTrack) => onTrackEdit(newTrack, selectedIndex)}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NewMix;
