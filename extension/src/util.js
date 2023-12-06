import { SERVER_URL, SUPPORTED_REGEX } from "./consts";

/**
 * make a request to the server
 * options format: { method, body }
 */
async function request(path, options = {}) {
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
    console.error(e);
    throw Error("Could not connect to server.");
  }
}

/** shortens a string to max 25 characters and adds ... at the end */
export function shorten(string) {
  let shortenedString = string.trim();
  if (shortenedString.length > 25) {
    shortenedString = shortenedString.slice(0, 25).trim() + "...";
  }
  return shortenedString;
}

/** returns true if the scroll was a mouse, false if it was a touchpad */
export function isMouse(event) {
  // https://stackoverflow.com/questions/10744645/detect-touchpad-vs-mouse-in-javascript
  return Number.isInteger(event.deltaY) && event.deltaY !== 0;
}

/** given url, determine whether it is a supported site */
export function siteSupported(url) {
  // the page is a new tab
  if (!url) return false;

  let result = false;
  SUPPORTED_REGEX.forEach((site) => {
    result = url.match(site) ? true : result;
  });

  return result;
}

/**
 * return an object with only the specified keys from the original
 *  @param keys an array of key names as strings
 */
export function pick(object, keys) {
  let newObj = {};
  keys.forEach((key) => {
    newObj = { ...newObj, [key]: object[key] };
  });
  return newObj;
}
