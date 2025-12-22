// @ts-nocheck

import { useCallback, useEffect } from "react";

/** add and remove background script listeners */
export function useListener(messageType, handler) {
  const messageHandler = useCallback(
    (message) => {
      if (message && message.type === messageType) {
        handler(message.payload);
      }
    },
    [messageType, handler]
  );
  useEffect(() => {
    // add listener
    browser.runtime.onMessage.addListener(messageHandler);

    // return cleanup function that removes listener
    return () => {
      browser.runtime.onMessage.removeListener(messageHandler);
    };
  }, [messageHandler]);

  // can also manually remove listener using this function
  const remove = useCallback(() => {
    browser.runtime.onMessage.removeListener(handler);
  }, [handler]);

  return { remove };
}
