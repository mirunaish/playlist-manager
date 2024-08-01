import React, { useCallback, useEffect, useState } from "react";
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
  // made these into a single state to force both to update at the same time
  // do not call this setter directly, use setSelectedTabId instead
  const [{ selectedTabId, page }, _setSelectedTabIdAndPage] = useState({
    selectedTabId: Pages.NEW_MIX,
    page: Pages.NEW_MIX,
  });

  /** set the tab id and determine page type */
  const setSelectedTabId = useCallback((tabId) => {
    (async () => {
      // if one of the special tabs, switch to that page
      if (Object.values(Pages).includes(tabId)) {
        console.log("switching to special page");
        _setSelectedTabIdAndPage({ selectedTabId: tabId, page: tabId });
        return;
      }

      console.log("asking background for tab type");
      // else get type of normal tab and switch to that page
      const type = await background("getTabType", tabId);
      _setSelectedTabIdAndPage({ selectedTabId: tabId, page: type });
    })();
  }, []);

  // ask background script for initial selected tab id
  useEffect(() => {
    (async () => {
      const tabId = await background("getMostImportantTabId");
      console.log("selected tab is", tabId);
      if (tabId) setSelectedTabId(tabId);
    })();
  }, [setSelectedTabId]);

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
