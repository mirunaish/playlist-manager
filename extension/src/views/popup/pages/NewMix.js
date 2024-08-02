import React, { useCallback, useMemo, useEffect, useState } from "react";
import Rating from "../components/Rating";
import Button from "../components/Button";
import { useStatusUpdate } from "../hooks";
import { background } from "../util";
import Thumbnail from "../components/Thumbnail";
import { Icons } from "../icons";
import Banner from "../components/Banner";
import { StatusTypes } from "../../../consts";
import Filters from "../modules/Filters";

/** start new custom playlist page */
function NewMix() {
  const updateStatus = useStatusUpdate();

  const [filters, setFilters] = useState({
    artists: [],
    includedTags: [],
    excludedTags: [],
    rating: [3, 4, 5, 6],
    name: "New Mix",
    theme: "DARK_PINK",
  });

  // ask background script for track info from page
  // useEffect(() => {
  //   (async () => {
  //     const info = await background.getUntrackedInfo(selectedTabId);
  //     setTrackInfo(info);
  //   })();
  // }, [background, selectedTabId]);

  const play = useCallback(async () => {
    console.log("play button pressed");
    updateStatus({ message: "this is a test", type: StatusTypes.SUCCESS });
    // await background("play", filters);
  }, [updateStatus]);

  return (
    <div>
      <Banner title="New mix" />

      <Filters filters={filters} setFilters={setFilters}>
        <Button title="Play" onClick={play} />
      </Filters>
    </div>
  );
}

export default NewMix;
