import React, { useCallback, useMemo, useEffect, useState } from "react";
import Rating from "../components/Rating";
import Button from "../components/Button";
import { useBackground, useStatusUpdate } from "../hooks";
import Thumbnail from "../components/Thumbnail";
import { Icons } from "../icons";
import ZoneBanner from "../components/ZoneBanner";
import { MessageTypes, StatusTypes } from "../../../consts";

function Untracked({ selectedTabId }) {
  const background = useBackground();
  const updateStatus = useStatusUpdate();

  const initialTrackInfo = { rating: 0 };
  const [trackInfo, setTrackInfo] = useState(initialTrackInfo);
  const updateFields = useCallback(
    (fields) => {
      setTrackInfo({ ...trackInfo, ...fields });
    },
    [trackInfo]
  );

  // set track info on message from background (who's just forwarding it from content script)
  useEffect(() => {
    // listen for track info messages
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === MessageTypes.TRACK_INFO_FORWARD) {
        // populate track info with received data
        console.log("setting track info from content script:", message.payload);
        updateFields(message.payload);
      }
    });
  }, [updateFields]);

  // ask background to send track info message at some point
  useEffect(() => {
    // tab changed. reset track info TODO doesn't work
    setTrackInfo(initialTrackInfo);
    // ask background script to get track info from page
    background.getUntrackedInfo(selectedTabId);
  }, [background, selectedTabId]);

  // set zone id to default zone
  useEffect(() => {
    if (!trackInfo.zoneId) {
      (async () => {
        // TODO ask background for default zone to auto select
        const zones = await background.getAllZones();
        updateFields({ zoneId: Object.keys(zones)[0] });
      })();
    }
  }, [background, selectedTabId, trackInfo, updateFields]);

  const save = useCallback(async () => {
    console.log("save button pressed");
    updateStatus({ message: "this is a test", type: StatusTypes.SUCCESS });
    // await background.add(trackInfo);
  }, [background, trackInfo, updateStatus]);

  console.log(trackInfo);

  return (
    <div>
      <ZoneBanner title="Untracked" disabled={true} />

      <Thumbnail src={trackInfo.imageLink} alt="thumbnail" />
      <input
        value={trackInfo.title}
        onChange={(e) => updateFields({ title: e.target.value })}
      />
      <input
        value={trackInfo.artist}
        onChange={(e) => updateFields({ artist: e.target.value })}
      />
      <input
        value={trackInfo.imageLink}
        onChange={(e) => updateFields({ imageLink: e.target.value })}
      ></input>
      <Rating
        value={trackInfo.rating}
        extended={true}
        onChange={(e) => updateFields({ rating: e.target.value })}
      />

      <Button
        title="save"
        onClick={save}
        icon={{ icon: Icons.YOUTUBE, type: Icons.FILL }}
      />
    </div>
  );
}

export default Untracked;
