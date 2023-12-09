import React, { useCallback, useMemo, useEffect, useState } from "react";
import Rating from "../components/Rating";
import Button from "../components/Button";
import { useBackground, useListener, useStatusUpdate } from "../hooks";
import Thumbnail from "../components/Thumbnail";
import { Icons } from "../icons";
import ZoneBanner from "../components/ZoneBanner";
import { MessageTypes, StatusTypes } from "../../../consts";

const initialTrackInfo = { rating: 0 };

function Untracked({ selectedTabId }) {
  const background = useBackground();
  const updateStatus = useStatusUpdate();
  const trackInfoListener = useListener();

  const [trackInfo, setTrackInfo] = useState(initialTrackInfo);
  const updateFields = useCallback(
    (fields) => {
      setTrackInfo({ ...trackInfo, ...fields });
    },
    [trackInfo]
  );

  useEffect(() => {
    // tab changed. reset track info
    setTrackInfo(initialTrackInfo);
  }, [selectedTabId]);

  // set track info
  useEffect(() => {
    // listener function that sets track data
    const listener = (message) => {
      console.log("message is", message);
      if (message && message.type === MessageTypes.TRACK_INFO_FORWARD) {
        console.log("setting track info from content script:", message.payload);

        // remove listener
        trackInfoListener.remove();

        // populate track info with received data
        updateFields(message.payload);
      }
    };

    // if title has not been set,
    if (!trackInfo.title) {
      // listen for track info messages
      console.log("adding the listener");
      trackInfoListener.add(listener);
      // ask background script to get track info from page
      background.getUntrackedInfo(selectedTabId);
    }

    if (!trackInfo.zoneId) {
      (async () => {
        // TODO ask background for default zone to auto select
        const zones = await background.getAllZones();
        updateFields({ zoneId: Object.keys(zones)[0] });
      })();
    }
  }, [updateFields, trackInfo, background, selectedTabId, trackInfoListener]);

  // remove listener when unmounting component
  // useEffect(() => () => {
  //   console.log("component is removing its listener");
  //   trackInfoListener.remove();
  // });

  const save = useCallback(async () => {
    console.log("save button pressed");
    updateStatus({ message: "this is a test", type: StatusTypes.SUCCESS });
    // await background.add(trackInfo);
  }, [background, trackInfo, updateStatus]);

  return (
    <div>
      <ZoneBanner title="Untracked" disabled={true} />

      <Thumbnail src={trackInfo.imageLink} alt="thumbnail" />
      <input
        value={trackInfo.title ?? ""}
        onChange={(e) => updateFields({ title: e.target.value })}
      />
      <input
        value={trackInfo.artist ?? ""}
        onChange={(e) => updateFields({ artist: e.target.value })}
      />
      <input
        value={trackInfo.imageLink ?? ""}
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
