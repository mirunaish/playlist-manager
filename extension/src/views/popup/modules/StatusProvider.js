import { createContext, useContext, useState } from "react";
import { MessageTypes, StatusTypes } from "../../../consts";
import { useListener } from "../hooks";

const StatusContext = createContext({
  status: { message: "", type: StatusTypes.INFO },
  setStatus: (message, type) => null,
});

function StatusProvider({ children }) {
  const [status, _setStatus] = useState({
    message: "",
    type: StatusTypes.INFO,
  });

  function setStatus(message, type = StatusTypes.INFO) {
    _setStatus({ message, type });
  }

  // listen for status messages from background
  useListener(MessageTypes.STATUS_UPDATE, ({ message, type }) => {
    setStatus(message, type);
  });

  return (
    <StatusContext.Provider value={{ status, setStatus }}>
      {children}
    </StatusContext.Provider>
  );
}

export function useStatus() {
  return useContext(StatusContext).status;
}

export function useStatusUpdate() {
  return useContext(StatusContext).setStatus;
}

export default StatusProvider;
