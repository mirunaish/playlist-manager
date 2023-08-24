/**
 * shortens a title to max 25 characters and adds ... at the end
 */
export function shortenTitle(title) {
  if (title.length > 25) {
    title = title.slice(0, 25).trim() + "...";
  }
  return title;
}

/**
 * returns true if the scroll was a mouse, false if it was a touchpad
 */
export function isMouse(event) {
  // https://stackoverflow.com/questions/10744645/detect-touchpad-vs-mouse-in-javascript
  return Number.isInteger(event.deltaY) && event.deltaY !== 0;
}
