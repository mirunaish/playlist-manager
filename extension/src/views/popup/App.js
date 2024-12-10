import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import Status from "./modules/Status";
import Tabs from "./modules/Tabs";
import { background } from "./util";
import { MessageTypes, Pages } from "../../consts";
import {
  NewMix,
  Search,
  Quickplay,
  Settings,
  Playlist,
  Tracked,
  Untracked,
} from "./pages";
import { useListener } from "./hooks";

function App() {
  // made these into a single state to force both to update at the same time
  // do not call this setter directly, use setSelectedTabId instead
  const [{ selectedTabId, page }, _setSelectedTabIdAndPage] = useState({
    selectedTabId: Pages.DEFAULT,
    page: Pages.DEFAULT,
  });

  /** set the tab id and determine page type */
  const setSelectedTabId = useCallback((tabId) => {
    (async () => {
      // if one of the special tabs, switch to that page
      if (Object.values(Pages).includes(tabId)) {
        _setSelectedTabIdAndPage({ selectedTabId: tabId, page: tabId });
        return;
      }

      // else get type of normal tab and switch to that page
      const type = await background("getTabType", tabId);
      _setSelectedTabIdAndPage({ selectedTabId: tabId, page: type });
    })();
  }, []);

  // ask background script for initial selected tab id
  useEffect(() => {
    (async () => {
      const tabId = await background("getMostImportantTabId");
      if (tabId) setSelectedTabId(tabId);
    })();
  }, [setSelectedTabId]);

  // listen for background script telling me to select a tab
  useListener(MessageTypes.SELECT_TAB, ({ id }) => {
    setSelectedTabId(id);
  });

  return (
    <>
      {/*
       * status is first so the status update listener is added
       * before other components are rendered.
       * root has flexDirection: column-reverse so this is at the bottom
       */}
      <Status />

      <div style={{ flexGrow: 1 }}>
        {/* select page based on tab info */}
        {page === Pages.NEW_MIX && <NewMix />}
        {page === Pages.SEARCH && <Search />}
        {page === Pages.QUICKPLAY && <Quickplay />}
        {page === Pages.Settings && <Settings />}
        {page === Pages.PLAYLIST && <Playlist selectedTabId={selectedTabId} />}
        {page === Pages.TRACKED && <Tracked selectedTabId={selectedTabId} />}
        {page === Pages.UNTRACKED && (
          <Untracked selectedTabId={selectedTabId} />
        )}
      </div>

      <Tabs selectedTabId={selectedTabId} selectTab={setSelectedTabId} />
    </>
  );
}

export default App;
