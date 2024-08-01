import React, { useEffect, useState } from "react";
import "./App.css";
import Status from "./modules/Status";
import Tabs from "./modules/Tabs";
import { background } from "./util";
import { Pages } from "../../consts";
import {
  NewMix,
  Search,
  Quickplay,
  Settings,
  Playlist,
  Tracked,
  Untracked,
} from "./pages";

function App() {
  const [selectedTabId, setSelectedTabId] = useState("+");
  const [page, setPage] = useState(null);

  // ask background script for selected tab id
  useEffect(() => {
    (async () => {
      const tabId = await background("getMostImportantTabId");
      console.log("selected tab is", tabId);
      if (tabId) setSelectedTabId(tabId);
    })();
  }, []);

  // set the page type
  useEffect(() => {
    setPage(null);

    (async () => {
      // if one of the special tabs, switch to that page
      if (Object.values(Pages).includes(selectedTabId)) {
        setPage(selectedTabId);
        return;
      }

      // else get type of normal tab and switch to that page
      const type = await background("getTabType", selectedTabId);
      setPage(type);
    })();
  }, [selectedTabId]);

  return (
    <>
      {/*
       * status is first so the status update listener is added
       * before other components are rendered
       */}
      <Status />

      <Tabs selectedTabId={selectedTabId} selectTab={setSelectedTabId} />

      {/* select page based on tab info */}
      {page === Pages.NEW_MIX && <NewMix />}
      {page === Pages.SEARCH && <Search />}
      {page === Pages.QUICKPLAY && <Quickplay />}
      {page === Pages.Settings && <Settings />}

      {page === Pages.PLAYLIST && <Playlist selectedTabId={selectedTabId} />}
      {page === Pages.TRACKED && <Tracked selectedTabId={selectedTabId} />}
      {page === Pages.UNTRACKED && <Untracked selectedTabId={selectedTabId} />}
    </>
  );
}

export default App;
