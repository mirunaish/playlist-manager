// this is to prevent error messages everywhere

import { MessageTypes } from "../utils";

// @ts-ignore
export const getBrowser = () => browser;

/** send a message to popup */
export async function popup(messageType, payload) {
  await getBrowser().runtime.sendMessage({
    type: messageType,
    payload,
  });
}

/** update status bar in popup with info (default), error, or success */
export async function updateStatus(message, statusType) {
  try {
    await popup(MessageTypes.STATUS_UPDATE, { message, statusType });
  } catch (e) {
    console.error('failed to update status "' + message + '";', e);
  }
}

/** insert a content script */
export async function insertScript(tabId, scriptName) {
  // in the source the content scripts are in a separate folder
  // but in the build folder they're in the same folder as the background script
  const scriptPath = "static/js/" + scriptName;
  console.log("inserting script", scriptName, "into tab", tabId);
  await getBrowser().tabs.executeScript(tabId, {
    file: scriptPath,
  });
}
