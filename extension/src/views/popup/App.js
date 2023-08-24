import React, { useEffect, useState } from "react";
import "./App.css";
import Status from "./components/Status";
import Tabs from "./components/Tabs";
import { useBackground } from "../../hooks";

function App() {
  const background = useBackground();

  const [selectedTabId, setSelectedTabId] = useState("+");

  // ask background script for selected tab
  useEffect(() => {
    (async () => {
      const tab = await background.getActiveTab();
      if (tab) setSelectedTabId(tab.id);
    })();
  }, [background]);

  return (
    <>
      <Tabs selectedTabId={selectedTabId} selectTab={setSelectedTabId} />

      <Status />
    </>
  );
}

export default App;
