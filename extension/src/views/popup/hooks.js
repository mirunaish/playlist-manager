// @ts-nocheck

import { useCallback, useEffect } from "react";
import { MessageTypes, StatusTypes } from "../../consts";

/** ask background to update status bar */
export function useStatusUpdate() {
  // send the message to the background script
  // the bg script will forward it to the status bar
  return useCallback(async (message, type = StatusTypes.INFO) => {
    await browser.runtime.sendMessage({
      type: MessageTypes.STATUS_UPDATE,
      message,
      statusType: type,
    });
  }, []);
}

/** add and remove background script listeners */
export function useListener(handler) {
  useEffect(() => {
    // add listener
    browser.runtime.onMessage.addListener(handler);

    // return cleanup function that removes listener
    return () => {
      browser.runtime.onMessage.removeListener(handler);
    };
  }, []);

  // can also manually remove listener using this function
  const remove = useCallback(() => {
    browser.runtime.onMessage.removeListener(handler);
  }, [handler]);

  return { remove };
}
