import React from "react";
import { StatusTypes } from "../../../utils";
import { useStatus, useStatusUpdate } from "./StatusProvider";

function Status() {
  const status = useStatus();
  const updateStatus = useStatusUpdate();

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
