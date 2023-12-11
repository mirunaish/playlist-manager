import React, { useCallback, useEffect, useState } from "react";
import { useBackground, useStatusUpdate } from "../hooks";
import ZoneBanner from "../components/ZoneBanner";
import { SupportedSites } from "../../../consts";
import Thumbnail from "../components/Thumbnail";
import Button from "../components/Button";
import Rating from "../components/Rating";
import PlayBar from "../components/PlayBar";
import { Icons } from "../icons";

function Tracked({ selectedTabId }) {
  const background = useBackground();

  const [trackInfo, setTrackInfo] = useState({
    title: null,
    artist: null,
    imageLink: null,
    url: "",
    zoneId: null,
    length: 0,
    rating: 0,
  });

  // ask background script for track info from database
  useEffect(() => {
    (async () => {
      const info = await background.getTrackedInfo(selectedTabId);
      setTrackInfo(info);
    })();
  }, [background, selectedTabId]);

  const search = useCallback(async (site) => {
    // background will open a new tab with the search
    await background.search(trackInfo.artist + " - " + trackInfo.title, site);
    // close the popup
    // @ts-ignore
    window.close();
  }, []);

  const edit = useCallback(async () => {
    console.log("edit button pressed");
    // await background.edit(trackInfo);
  }, [background, trackInfo]);

  return (
    <div>
      <ZoneBanner zoneId={trackInfo.zoneId} disabled={true}></ZoneBanner>

      <Thumbnail src={trackInfo.imageLink} />

      <p>{trackInfo.url}</p>

      <p>Search for this track on:</p>
      {/* render buttons for sites except ones this track is on */}
      {Object.entries(SupportedSites).map(([site, { regex }]) => {
        return trackInfo.url.match(regex) ? null : (
          <Button
            key={site}
            icon={{ icon: Icons[site.toUpperCase()], type: Icons.FILL }}
            onClick={() => search(site)}
          />
        );
      })}

      <input
        value={trackInfo.title ?? ""}
        onChange={(e) => {
          setTrackInfo({ ...trackInfo, title: e.target.value });
        }}
      />
      <input
        value={trackInfo.artist ?? ""}
        onChange={(e) => {
          setTrackInfo({ ...trackInfo, artist: e.target.value });
        }}
      />
      <input
        value={trackInfo.imageLink ?? ""}
        onChange={(e) => {
          setTrackInfo({ ...trackInfo, imageLink: e.target.value });
        }}
      ></input>
      <Rating
        value={trackInfo.rating}
        extended={true}
        onChange={(e) => {
          setTrackInfo({ ...trackInfo, rating: e.target.value });
        }}
      />

      <Button title="edit" onClick={edit} />

      <PlayBar totalTime={60 * 3} currentTime={44} />
    </div>
  );
}

export default Tracked;
