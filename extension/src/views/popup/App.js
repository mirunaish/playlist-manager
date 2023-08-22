import React, { useCallback, useMemo, useEffect, useState } from "react";
import "./App.css";
import Status from "./components/Status";
import Tabs from "./components/Tabs";
import { useBackground } from "../../hooks";

function App() {
  const background = useBackground();

  const [allTabs, setAllTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState("+");

  // ask background script for all supported site tabs in browser
  useEffect(() => {
    (async () => {
      setAllTabs(await background.getSupportedTabs());
      const selectedTab = await background.getActiveTab();
      if (selectedTab) setSelectedTab(selectedTab);
    })();
  }, [background]);

  return (
    <>
      <Tabs
        allTabs={allTabs}
        selectedTab={selectedTab}
        selectTab={setSelectedTab}
      ></Tabs>

      <Status></Status>
    </>
  );
}

export default App;
