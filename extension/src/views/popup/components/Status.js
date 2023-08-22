import React, { useEffect, useState } from "react";

function Status() {
  console.log("rendering status");

  const [status, setStatus] = useState("");

  const updateStatus = (message, sender, sendResponse) => {
    // do something here

    setStatus(message);
  };

  // listen for messages from background
  useEffect(() => {
    browser.runtime.onMessage.addListener(updateStatus);
  }, []);

  return <p>{status}</p>;
}

export default Status;
