import React, { useEffect, useState, useMemo } from "react";
import "./App.css";
import Status from "./components/Status";
import Tabs from "./components/Tabs";
import Playlist from "./pages/Playlist";
import Tracked from "./pages/Tracked";
import Untracked from "./pages/Untracked";
import NewTab from "./pages/NewTab";
import { useBackground } from "./hooks";
import { Pages } from "../../consts";
import Settings from "./pages/Settings";

function App() {
  const background = useBackground();

  const [selectedTabId, setSelectedTabId] = useState("+");
  const [page, setPage] = useState(null);

  // ask background script for selected tab id
  useEffect(() => {
    (async () => {
      const tabId = await background.getMostImportantTabId();
      console.log("selected tab is", tabId);
      if (tabId) setSelectedTabId(tabId);
    })();
  }, [background]);

  // set the page type
  useEffect(() => {
    (async () => {
      if (selectedTabId === "+") {
        setPage(Pages.NEW_TAB);
        return;
      }
      if (selectedTabId === "settings") {
        setPage(Pages.SETTINGS);
        return;
      }
      const type = await background.getTabType(selectedTabId);
      setPage(type);
    })();
  }, [background, selectedTabId]);

  return (
    <>
      {/* status is first so the status update listener is added before other components are rendered */}
      <Status />

      <Tabs selectedTabId={selectedTabId} selectTab={setSelectedTabId} />

      {/* select page based on tab info */}
      {page === Pages.NEW_TAB && <NewTab />}
      {page === Pages.SETTINGS && <Settings />}
      {page === Pages.PLAYLIST && <Playlist selectedTabId={selectedTabId} />}
      {page === Pages.TRACKED && <Tracked selectedTabId={selectedTabId} />}
      {page === Pages.UNTRACKED && <Untracked selectedTabId={selectedTabId} />}
    </>
  );
}

export default App;
