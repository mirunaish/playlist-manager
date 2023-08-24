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
      const tab = await background.getMostImportantTab();
      if (tab) setSelectedTabId(tab.id);
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
