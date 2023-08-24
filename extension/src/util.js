import { SUPPORTED_REGEX } from "./consts";

/** shortens a title to max 25 characters and adds ... at the end */
export function shortenTitle(title) {
  if (title.length > 25) {
    title = title.slice(0, 25).trim() + "...";
  }
  return title;
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
