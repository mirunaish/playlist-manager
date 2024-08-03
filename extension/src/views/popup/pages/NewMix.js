import React, { useCallback, useMemo, useEffect, useState } from "react";
import Button from "../components/Button";
import { useStatusUpdate } from "../hooks";
import { background } from "../util";
import Banner from "../components/Banner";
import { StatusTypes } from "../../../consts";
import Filters from "../modules/Filters";
import List from "../modules/List";
import Stats from "../modules/Stats";
import ThemesDropdown from "../modules/ThemesDropdown";

/** start new custom playlist page */
function NewMix() {
  const updateStatus = useStatusUpdate();

  const [filters, setFilters] = useState({
    artists: [],
    includedTags: [],
    excludedTags: [],
    rating: [3, 4, 5, 6],
  });
  const [mixName, setMixName] = useState("New Mix");
  const [theme, setTheme] = useState("DARK_PINK");

  const [playlist, setPlaylist] = useState(null);
  const [stats, setStats] = useState(null);

  // ask background script for track info from page
  // useEffect(() => {
  //   (async () => {
  //     const info = await background.getUntrackedInfo(selectedTabId);
  //     setTrackInfo(info);
  //   })();
  // }, [background, selectedTabId]);

  const preview = useCallback(async () => {
    updateStatus("fetching playlist...");
    try {
      const { playlist, stats } = await background("previewPlaylist", filters);
      setPlaylist(playlist);
      setStats(stats);
      updateStatus("");
    } catch (e) {
      updateStatus(e.message, StatusTypes.ERROR);
    }
  }, [filters, updateStatus]);

  const play = useCallback(async () => {
    console.log("play button pressed");
    updateStatus("this is a test", StatusTypes.SUCCESS);
    await background("play", filters);
  }, [filters, updateStatus]);

  const saveMix = useCallback(async () => {
    console.log("play button pressed");
    updateStatus("this is a test", StatusTypes.SUCCESS);
    await background("saveMix", filters);
  }, [filters, updateStatus]);

  const reshuffle = useCallback(() => {
    return;
  }, []);

  return (
    <div>
      <Banner title="New mix" />

      <Filters filters={filters} setFilters={setFilters}>
        {/** title and theme inputs */}
        <input
          placeholder="Mix title"
          value={mixName}
          // @ts-ignore
          onChange={(e) => setMixName(e.target.value)}
        />
        <ThemesDropdown value={theme} onChange={(value) => setTheme(value)} />

        <Button title="Preview" onClick={preview} />
        <Button title="Play" onClick={play} />
        <Button title="Save to Quickplay" onClick={saveMix} />
      </Filters>

      {playlist && stats ? (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: "max-content" }}>
            <List playlist={playlist}>
              <Button icon="🔀" onClick={reshuffle} />
              <Button icon="📌" onClick={saveMix} />
            </List>
          </div>
          <div style={{ flexGrow: 1 }}>
            <Stats stats={stats} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NewMix;
