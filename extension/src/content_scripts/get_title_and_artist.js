import { MessageTypes } from "../consts";

(function () {
  // get the text inside an element
  function getText(sel) {
    return document.querySelector(sel).textContent;
  }

  function youtube() {
    const vidId = window.location.href.match(/(?<=watch\?v=)[a-zA-Z0-9_\\-]*/g);

    return {
      fullTitle: document.title.slice(0, -10),
      posterName: getText("a.yt-formatted-string"),
      imageLink: "https://i.ytimg.com/vi/" + vidId + "/hqdefault.jpg",
      url: window.location.href.replace(/&.*/, ""),
    };
  }

  function soundcloud() {
    return {
      fullTitle: getText("h1.soundTitle__title > span"),
      posterName: getText("h2.soundTitle__username > a:nth-child(1)"),
    };
  }

  // TODO
  function spotify() {
    return { fullTitle: "", posterName: "" };
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
    }

    // get stuff from site-specific function
    const { fullTitle, posterName, imageLink, url } = func();

    // parse data into title and artists
    const { title, artists } = parseData(fullTitle, posterName);

    // send data to background script
    browser.runtime.sendMessage({
      type: MessageTypes.TRACK_INFO,
      payload: { title, artists, imageLink, url },
    });
  }

  // listen for background asking me to send data
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === MessageTypes.REQUEST_TRACK_INFO) {
      run();
    }
  });

  // also run once when loaded
  run();
})();
