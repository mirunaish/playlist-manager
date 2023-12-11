import React, { useCallback, useEffect, useState } from "react";
import Rating from "../components/Rating";
import Button from "../components/Button";
import { useBackground, useListener } from "../hooks";
import Thumbnail from "../components/Thumbnail";
import ZoneBanner from "../components/ZoneBanner";
import { MessageTypes, SupportedSites } from "../../../consts";
import PlayBar from "../components/PlayBar";
import ZonesDropdown from "../components/ZonesDropdown";
import { Icons } from "../icons";

function Untracked({ selectedTabId }) {
  const background = useBackground();
  const trackInfoListener = useListener();

  // need to separate track data into two to prevent threads from overwriting data from each other
  // TODO find a better way to do this?
  const [untrackedInfo, setUntrackedInfo] = useState({
    title: null,
    artist: null,
    imageLink: null,
    url: "",
    length: 0,
  }); // info from the content script
  const [trackInfo, setTrackInfo] = useState({ zoneId: null, rating: 0 }); // info from background + defaults
  // TODO add length from content script

  // on first render, add listener that adds track info from content script
  useEffect(() => {
    const listener = (message) => {
      if (message && message.type === MessageTypes.TRACK_INFO_FORWARD) {
        console.log("setting track info from content script:", message.payload);

        // populate track info with received data
        setUntrackedInfo(message.payload);
      }
    };

    console.log("adding track info listener");
    trackInfoListener.add(listener);

    // on cleanup, remove this listener (?)
    return trackInfoListener.remove;
  }, []);

  // whenever tab is changed, ask background for info about new track
  useEffect(() => {
    // ask background script to get track info from page
    background.getUntrackedInfo(selectedTabId);
    // background will later send a message with the info which the listener will catch

    // add zone
    (async () => {
      // TODO ask background for default zone to auto select
      const zones = await background.getAllZones();
      setTrackInfo({ ...trackInfo, zoneId: Object.keys(zones)[0] });
    })();
  }, [selectedTabId]);

  const search = useCallback(async (site) => {
    // background will open a new tab with the search
    await background.search(
      untrackedInfo.artist + " - " + untrackedInfo.title,
      site
    );
    // close the popup
    // @ts-ignore
    window.close();
  }, []);

  // save untracked track to backend
  const save = useCallback(async () => {
    console.log("saving track", { ...trackInfo, ...untrackedInfo });
    await background.add({ ...trackInfo, ...untrackedInfo });
  }, [background, trackInfo, untrackedInfo]);

  return (
    <div>
      <ZoneBanner title="Untracked" disabled={true} />

      <Thumbnail src={untrackedInfo.imageLink} />

      <p>{untrackedInfo.url}</p>

      <p>Search for this track on:</p>
      {/* render buttons for sites except ones this track is on */}
      {Object.entries(SupportedSites).map(([site, { regex }]) =>
        untrackedInfo.url.match(regex) ? null : (
          <Button
            icon={{ icon: Icons[site.toUpperCase()], type: Icons.FILL }}
            onClick={() => search(site)}
          />
        )
      )}

      <input
        value={untrackedInfo.title ?? ""}
        onChange={(e) => {
          setUntrackedInfo({ ...untrackedInfo, title: e.target.value });
        }}
      />
      <input
        value={untrackedInfo.artist ?? ""}
        onChange={(e) => {
          setUntrackedInfo({ ...untrackedInfo, artist: e.target.value });
        }}
      />
      <input
        value={untrackedInfo.imageLink ?? ""}
        onChange={(e) => {
          setUntrackedInfo({ ...untrackedInfo, imageLink: e.target.value });
        }}
      ></input>
      <Rating
        value={trackInfo.rating}
        extended={true}
        onChange={(e) => {
          setTrackInfo({ ...trackInfo, rating: e.target.value });
        }}
      />
      <ZonesDropdown
        selectedZoneId={trackInfo.zoneId}
        setZoneId={(v) => {
          setTrackInfo({ ...trackInfo, zoneId: v });
        }}
      />

      <Button title="save" onClick={save} />

      <PlayBar totalTime={60 * 3} currentTime={44} />
    </div>
  );
}

export default Untracked;
