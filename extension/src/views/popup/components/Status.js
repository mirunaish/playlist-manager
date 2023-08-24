import React, { useEffect, useState } from "react";
import { MessageTypes } from "../../../consts";

function Status() {
  const [status, setStatus] = useState({ message: "", type: "" });

  function updateStatus(message, type) {
    setStatus({ message, type });
  }

  // listen for status messages from background
  useEffect(() => {
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === MessageTypes.STATUS_UPDATE) {
        updateStatus(message.message, message.statusType);
      }
    });
  });

  return (
    <div
      className={"status " + status.type}
      onClick={() => updateStatus("", "")}
    >
      <p>{status.message}</p>
    </div>
  );
}

export default Status;
