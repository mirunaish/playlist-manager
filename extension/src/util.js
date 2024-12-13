import Color from "color";
import { SupportedSites } from "./consts";
import { startCase } from "lodash";

/** shortens a string to max 25 characters and adds ... at the end */
export function shorten(string) {
  let shortenedString = string.trim();
  if (shortenedString.length > 25) {
    shortenedString = shortenedString.slice(0, 25).trim() + "...";
  }
  return shortenedString;
}

/** convert a string to space separated start case */
export function humanReadable(string) {
  return startCase(string.toLowerCase().replace("_", " "));
}

/** return a string in format hh:mm:ss */
export function formatTime(totalSeconds) {
  const padNumber = (number) => (number > 9 ? number : "0" + number);

  const hours = Math.floor(totalSeconds / (60 * 60));
  const minutes = Math.floor((totalSeconds - hours * 60 * 60) / 60);
  const seconds = totalSeconds - hours * 60 * 60 - minutes * 60;

  var string = hours > 0 ? padNumber(hours) + ":" : ""; //exclude hours if 0
  string += padNumber(minutes) + ":";
  string += padNumber(seconds);

  return string;
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

/** should be identical to one in backend */
export function stripSupportedUrl(url) {
  if (url.includes("youtube")) {
    // remove everything after the first argument
    url = url.replace(/&.*$/, "");
  }
  return url;
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

/** calculate a contrasting text color for a given background color */
export function contrastingColor(code) {
  const color = Color(code);

  if (color.isDark())
    return Color({
      h: color.hue(),
      s: color.saturationl(),
      l: 95,
    }).hex();
  if (color.isLight())
    return Color({
      h: color.hue(),
      s: color.saturationl(),
      l: 5,
    }).hex();
}
