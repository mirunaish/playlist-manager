import { SERVER_URL, SupportedSites } from "./consts";

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

  for (let site of Object.values(SupportedSites)) {
    if (url.match(site.regex)) return true;
  }
  return false;
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

/** given an array of objects with ids, return a record from id to object */
export function buildRecord(array) {
  let record = {};
  array.forEach((element) => {
    record = { ...record, [element.id]: element };
  });

  return record;
}

/**
 * get the left and right neighbors of this index in an array
 * as a {left, right} object. if index is 0 or the last one, loop around to the
 * beginning / end
 */
export function getNeighbors(array, index) {
  // javascript modulo does not loop negative numbers around to the end. annoying
  // https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
  function mod(n, m) {
    return ((n % m) + m) % m;
  }
  // get neighbors of an element; loop around if at beginning or end
  const left = array[mod(index - 1, array.length)]; // previous element
  const right = array[mod(index + 1, array.length)]; // next element

  return { left, right };
}
