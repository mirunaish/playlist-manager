import { MessageTypes, SERVER_URL } from "../consts";

// this is to prevent error messages everywhere
// @ts-ignore
export const getBrowser = () => browser;

export async function getTab(tabId) {
  return await getBrowser().tabs.get(tabId);
}

/** send a message to popup */
export async function popup(messageType, ...args) {
  await getBrowser().runtime.sendMessage({
    type: messageType,
    args,
  });
}

/**
 * make a request to the server.
 * options format: { method, body }.
 * default method is GET
 */
export async function request(path, options = {}) {
  try {
    if (!options.method) options.method = "GET";

    // if get, cannot use body. use query instead
    if (options.method === "GET" && options.body) {
      let reqQuery = "?";
      for (var key in options.body) {
        reqQuery += key + "=" + encodeURIComponent(options.body[key]) + "&";
      }
      reqQuery = reqQuery.slice(0, -1);
      path += reqQuery;
      delete options.body;
    }
    if (options.body) {
      options.body = JSON.stringify(options.body);
      options.headers = { "Content-Type": "application/json" };
    }

    const response = await fetch(SERVER_URL + path, options);
    return { ok: response.ok, body: await response.json() };
  } catch (e) {
    console.error("request error:", e);
    throw Error("Could not connect to server.");
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
