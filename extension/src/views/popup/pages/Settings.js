import React, { useCallback, useMemo, useEffect, useState } from "react";
import Rating from "../components/Rating";
import Button from "../components/Button";
import { useBackground, useStatusUpdate } from "../hooks";
import Thumbnail from "../components/Thumbnail";
import { Icons } from "../icons";
import ZoneBanner from "../components/ZoneBanner";
import { StatusTypes } from "../../../consts";

function Settings() {
  const background = useBackground();
  const updateStatus = useStatusUpdate();

  // ask background script for track info from page
  // useEffect(() => {
  //   (async () => {
  //     const info = await background.getUntrackedInfo(selectedTabId);
  //     setTrackInfo(info);
  //   })();
  // }, [background, selectedTabId]);

  // const save = useCallback(async () => {
  //   console.log("save button pressed");
  //   updateStatus({ message: "this is a test", type: StatusTypes.SUCCESS });
  //   // await background.add(trackInfo);
  // }, [background, trackInfo, updateStatus]);

  return (
    <div>
      <ZoneBanner />

      <Button
        title="save"
        // onClick={save}
      />
    </div>
  );
}

export default Settings;
