import React, { useState } from "react";
import { MessageTypes, StatusTypes } from "../../../consts";
import { useListener } from "../hooks";

function Status() {
  const [status, setStatus] = useState({ message: "", type: StatusTypes.INFO });

  function updateStatus(message, type) {
    setStatus({ message, type });
  }

  // listen for status messages from background
  useListener(MessageTypes.STATUS_UPDATE, ({ message, type }) => {
    updateStatus(message, type);
  });

  return (
    <div
      className={"status " + status.type}
      onClick={() => updateStatus("", StatusTypes.INFO)}
    >
      <p>{status.message}</p>
    </div>
  );
}

export default Status;
