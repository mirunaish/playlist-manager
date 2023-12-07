import React, { useCallback, useMemo, useEffect, useState } from "react";
import Rating from "../components/Rating";
import Button from "../components/Button";
import { useBackground, useStatusUpdate } from "../hooks";
import Thumbnail from "../components/Thumbnail";
import { Icons } from "../icons";
import ZoneBanner from "../components/ZoneBanner";
import { StatusTypes } from "../../../consts";

function Untracked({ selectedTabId }) {
  const background = useBackground();
  const updateStatus = useStatusUpdate();

  const [trackInfo, setTrackInfo] = useState({});

  // populate track info
  useEffect(() => {
    (async () => {
      let newTrackInfo = {};
      // ask background script for track info from page
      const info = await background.getUntrackedInfo(selectedTabId);
      newTrackInfo = { ...newTrackInfo, ...info };

      // TODO ask background for default zone to auto select
      const zones = await background.getAllZones();
      newTrackInfo = { ...newTrackInfo, zoneId: Object.keys(zones)[0] }; // first zone by default

      setTrackInfo(newTrackInfo);
    })();
  }, [background, selectedTabId]);

  const save = useCallback(async () => {
    console.log("save button pressed");
    updateStatus({ message: "this is a test", type: StatusTypes.SUCCESS });
    // await background.add(trackInfo);
  }, [background, trackInfo, updateStatus]);

  return (
    <div>
      <ZoneBanner title="Untracked" disabled={true} />

      <Thumbnail src={trackInfo.imgUrl} alt="thumbnail" />
      <input
        value={trackInfo.title}
        onChange={(e) => setTrackInfo({ ...trackInfo, title: e.target.value })}
      />
      <input
        value={trackInfo.author}
        onChange={(e) => setTrackInfo({ ...trackInfo, author: e.target.value })}
      />
      <input
        value={trackInfo.imgUrl}
        onChange={(e) => setTrackInfo({ ...trackInfo, imgUrl: e.target.value })}
      ></input>
      <Rating
        value={trackInfo.rating}
        extended={true}
        onChange={(e) => setTrackInfo({ ...trackInfo, rating: e.target.value })}
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
