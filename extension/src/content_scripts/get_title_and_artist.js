import { MessageTypes } from "../consts";

(function () {
  let fullTitle = "";
  let posterName = "";

  // get the text inside an element
  function getText(sel) {
    return document.querySelector(sel).textContent;
  }

  function youtube() {
    fullTitle = document.title.slice(0, -10);
    posterName = getText(
      "ytd-video-owner-renderer.ytd-video-secondary-info-renderer ytd-channel-name a"
    );
  }

  function soundcloud() {
    fullTitle = getText("h1.soundTitle__title > span");
    posterName = getText("h2.soundTitle__username > a:nth-child(1)");
  }

  // TODO
  function spotify() {
    fullTitle = "";
    posterName = "";
  }

  function parseData() {
    let title = "";
    let artist = "";

    // remove things like (official audio)
    fullTitle = fullTitle.replace(/\([^)]*audio[^(]*\)/gi, "");
    fullTitle = fullTitle.replace(/\([^)]*video[^(]*\)/gi, "");
    fullTitle = fullTitle.replace(/\[[^\]]*audio[^[]*\]/gi, "");
    fullTitle = fullTitle.replace(/\[[^\]]*video[^[]*\]/gi, "");

    // separate artist and title
    let array = fullTitle.split("-");
    if (array.length > 1) {
      artist = array[0];
      title = array[1];
    } else {
      // title is likely just title and poster is artist
      title = fullTitle;
      artist = posterName;
    }

    // remove extra spaces
    title = title.trim().replace(/ +/g, " ");
    artist = artist.trim().replace(/ +/g, " ");

    return { title, artist };
  }

  const where = window.location.href;
  // run site-specific function
  if (where.includes("://www.youtube.com/")) {
    youtube();
  } else if (where.includes("://soundcloud.com/")) {
    soundcloud();
  } else if (where.includes("://open.spotify.com/")) {
    spotify();
  }

  // send data to background script
  browser.runtime.sendMessage({
    type: MessageTypes.TRACK_INFO,
    payload: parseData(),
  });
})();
