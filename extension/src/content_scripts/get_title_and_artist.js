import { MessageTypes } from "../utils";

(function () {
  function getElement(sel) {
    return document.querySelector(sel);
  }
  // get the text inside an element
  function getText(sel) {
    return getElement(sel).textContent;
  }

  function parseDuration(durationString) {
    const d = durationString.split(":").map((t) => parseInt(t));
    let duration = 0;
    if (d.length === 3) duration = d[0] * 3600 + d[1] * 60 + d[2];
    else if (d.length === 2) duration = d[0] * 60 + d[1];
    // perhaps it's longer than a day...
    else if (d.length === 4)
      duration = d[0] * 24 * 3600 + d[1] * 3600 + d[2] * 60 + d[3];

    return duration;
  }

  function youtube() {
    const vidId = window.location.href.match(/(?<=watch\?v=)[a-zA-Z0-9_\\-]*/g);

    return {
      fullTitle: document.title.slice(0, -10),
      posterName: getText("a.yt-formatted-string"),
      imageLink: "https://i3.ytimg.com/vi/" + vidId + "/maxresdefault.jpg",
      url: window.location.href.replace(/&.*/, ""),
      duration: getText(".ytp-time-duration"),
    };
  }

  function soundcloud() {
    const imageSpan = getElement("span.sc-artwork-40x");
    const imageLink = imageSpan?.style?.backgroundImage?.slice(5, -2) ?? "";

    // duration might not be accurate. it's from the player at the bottom, not the actual track page..
    return {
      fullTitle: getText("h1.soundTitle__title > span"),
      posterName: getText("h2.soundTitle__username > a:nth-child(1)"),
      imageLink,
      duration: getText(".playbackTimeline__duration > span:nth-child(2)"),
      url: window.location.href.replace(/\?.*/, ""),
    };
  }

  // TODO
  function spotify() {
    return {
      fullTitle: "",
      posterName: "",
      imageLink: "",
      duration: 0,
      url: window.location.href,
    };
  }

  function parseData(fullTitle, posterName) {
    // remove things like (official audio)
    fullTitle = fullTitle.replace(/\([^)]*audio[^(]*\)/gi, "");
    fullTitle = fullTitle.replace(/\([^)]*video[^(]*\)/gi, "");
    fullTitle = fullTitle.replace(/\[[^\]]*audio[^[]*\]/gi, "");
    fullTitle = fullTitle.replace(/\[[^\]]*video[^[]*\]/gi, "");

    // separate artist and title
    const array = fullTitle.split("-");
    let title = "";
    let artist = "";
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

    // separate multiple artists, and remove extra whitespace
    const artists = artist
      .split(/,|&|and/)
      .map((a) => a.trim().replace(/ +/g, " "));

    return { title, artists };
  }

  function run() {
    const where = window.location.href;
    let func = null;
    // choose which site-specific function to run
    if (where.includes("://www.youtube.com/")) {
      func = youtube;
    } else if (where.includes("://soundcloud.com/")) {
      func = soundcloud;
    } else if (where.includes("://open.spotify.com/")) {
      func = spotify;
    } else {
      func = () => ({
        fullTitle: "",
        posterName: "",
        imageLink: "",
        duration: 0,
        url: window.location.href,
      });
    }

    // get stuff from site-specific function
    const {
      fullTitle,
      posterName,
      imageLink,
      url,
      duration: durationString,
    } = func();

    // parse data into title and artists
    const { title, artists } = parseData(fullTitle, posterName);
    const duration = parseDuration(durationString);

    // send data to background script
    return { title, artists, imageLink, url, duration };
  }

  // listen for background asking me to send data
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === MessageTypes.REQUEST_TRACK_INFO) {
      const requesterId = message.payload.requesterId;
      const result = run();
      browser.runtime.sendMessage({
        type: MessageTypes.TRACK_INFO,
        payload: { ...result, requesterId },
      });
    }
  });
})();
