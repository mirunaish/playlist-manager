// @ts-nocheck

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageTypes } from "../../consts";

/** get a reference to the background page to call its functions directly */
export function useBackground() {
  // background page probably never changes
  const background = useMemo(() => {
    return browser.extension.getBackgroundPage();
  }, []);

  return background;
}

/** ask background to update status bar */
export function useStatusUpdate() {
  // send the message to the background script
  // the bg script will forward it to the status bar
  return useCallback(async ({ message, type }) => {
    await browser.runtime.sendMessage({
      type: MessageTypes.STATUS_UPDATE,
      message,
      statusType: type,
    });
  }, []);
}

/** add and remove background script listeners */
export function useListener() {
  const [listener, setListener] = useState(null);

  const add = (func) => {
    if (listener) browser.runtime.onMessage.removeListener(listener);
    browser.runtime.onMessage.addListener(func);
    setListener(func);
  };

  const remove = () => {
    if (!listener) return;
    console.log("removing listener on request");
    browser.runtime.onMessage.removeListener(listener);
  };

  // remove listener when unmounting
  useEffect(
    () => () => {
      if (!listener) return;
      console.log("removing listener on cleanup");
      browser.runtime.onMessage.removeListener(listener);
    },
    []
  );

  return { add, remove };
}
