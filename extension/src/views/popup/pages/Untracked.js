import React, { useCallback, useEffect, useState } from "react";
import Rating from "../components/Rating";
import Button from "../components/Button";
import { useListener } from "../hooks";
import { background } from "../util";
import Thumbnail from "../components/Thumbnail";
import Banner from "../components/Banner";
import { MessageTypes, SupportedSites } from "../../../consts";
import PlayBar from "../components/PlayBar";
import { Icons } from "../icons";

const emptyTrack = {
  title: null,
  artist: null,
  imageLink: null,
  url: "",
  length: 0,
};

function Untracked({ selectedTabId }) {
  // need to separate track data into two to prevent threads from overwriting data from each other
  // TODO find a better way to do this?
  const [untrackedInfo, setUntrackedInfo] = useState(emptyTrack); // info from the content script
  const [trackInfo, setTrackInfo] = useState({ rating: 0 }); // info from background + defaults
  // TODO add length from content script

  // add listener that adds track info from content script
  useListener(MessageTypes.TRACK_INFO_FORWARD, (payload) => {
    // populate track info with received data
    setUntrackedInfo(payload);
  });
  // listener removes itself on cleanup if not manually removed

  // get untracked info from content script
  useEffect(() => {
    // reset untracked info
    setUntrackedInfo(emptyTrack);
    // ask background script to get track info from page
    background("getUntrackedInfo", selectedTabId);
    // background will later send a message with the info which the listener will catch
  }, [selectedTabId]);

  const search = useCallback(
    async (site) => {
      // background will open a new tab with the search
      await background(
        "searchOtherSite",
        untrackedInfo.title + " - " + untrackedInfo.artist,
        site
      );
      // close the popup
      // @ts-ignore
      window.close();
    },
    [untrackedInfo.title, untrackedInfo.artist]
  );

  // save untracked track to backend
  const save = useCallback(async () => {
    console.log("saving track", { ...trackInfo, ...untrackedInfo });
    await background("add", { ...trackInfo, ...untrackedInfo });
  }, [trackInfo, untrackedInfo]);

  return (
    <div>
      <Banner title="Untracked" />

      <Thumbnail src={untrackedInfo.imageLink} />

      <p>{untrackedInfo.url}</p>

      <p>Search for this track on:</p>
      {/* render buttons for sites except ones this track is on */}
      {Object.entries(SupportedSites).map(([site, { regex }]) =>
        untrackedInfo.url.match(regex) ? null : (
          <Button
            icon={{ icon: Icons[site.toUpperCase()], type: Icons.FILL }}
            onClick={() => search(site)}
            primary={false}
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
        onChange={(value) => {
          setTrackInfo({ ...trackInfo, rating: value });
        }}
      />

      <Button title="save" onClick={save} />

      <PlayBar totalTime={60 * 3} currentTime={44} />
    </div>
  );
}

export default Untracked;
