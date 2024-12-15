import React from "react";
import Button from "../components/Button";
import Banner from "../components/Banner";

function Settings() {
  // ask background script for track info from page
  // useEffect(() => {
  //   (async () => {
  //     const info = await background.getUntrackedInfo(selectedTabId);
  //     setTrackInfo(info);
  //   })();
  // }, [background, selectedTabId]);

  // const save = useCallback(async () => {
  //   console.log("save button pressed");
  //   updateStatus("this is a test", StatusTypes.SUCCESS);
  //   // await background.add(trackInfo);
  // }, [background, trackInfo, updateStatus]);

  return (
    <div className="page">
      <Banner />

      <Button
        primary
        title="save"
        // onClick={save}
      />
    </div>
  );
}

export default Settings;
