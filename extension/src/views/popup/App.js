import React, { useEffect, useState, useMemo } from "react";
import "./App.css";
import Status from "./components/Status";
import Tabs from "./components/Tabs";
import Playlist from "./pages/Playlist";
import Tracked from "./pages/Tracked";
import Untracked from "./pages/Untracked";
import { useBackground } from "./hooks";
import { Pages } from "../../consts";

function App() {
  const background = useBackground();

  const [selectedTabId, setSelectedTabId] = useState("+");

  // ask background script for selected tab id
  useEffect(() => {
    (async () => {
      const tabId = await background.getMostImportantTabId();
      console.log("selected tab is", tabId);
      if (tabId) setSelectedTabId(tabId);
    })();
  }, [background]);

  return (
    <>
      {/* status is first so the status update listener is added before other components are rendered */}
      <Status />

      <Tabs selectedTabId={selectedTabId} selectTab={setSelectedTabId} />
    </>
  );
}

export default App;
