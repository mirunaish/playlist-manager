import { MessageTypes } from "../consts";

(function () {
  // only run once
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  const forward = async () => {
    await browser.runtime.sendMessage({
      type: MessageTypes.MEDIA_CONTROL,
      action: "next",
    });
  };
  const backward = async () => {
    await browser.runtime.sendMessage({
      type: MessageTypes.MEDIA_CONTROL,
      action: "previous",
    });
  };

  // wait until the condition becomes true then call callback
  function waitUntilAndThen(condition, callback) {
    if (!condition()) {
      // wait for a bit then try again
      setTimeout(() => {
        waitUntilAndThen(condition, callback);
      }, 200);
    } else {
      callback();
    }
  }

  // try to call the callback for a few seconds
  function tryRepeatedlyForTo(timeInSeconds, callback) {
    function makeTry() {
      callback();
      setTimeout(makeTry, 200);
    }
    makeTry();
    // after the time is up, stop making attempts
    setTimeout(() => {
      makeTry = () => {};
    }, timeInSeconds * 1000);
  }

  // add handlers for hardware media control events
  function addHandlers() {
    window.navigator.mediaSession.setActionHandler("nexttrack", () => {
      console.log("next");
      forward();
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      console.log("previous");
      if (pastTenSeconds()) restart();
      else backward();
    });
  }

  // set these for each site
  let pastTenSeconds = () => {};
  let restart = () => {};

  function youtube() {
    function elemExists() {
      const search = "h1.title.style-scope.ytd-video-primary-info-renderer";
      return document.querySelector(search)?.firstChild;
    }

    // wait for everything to properly load (:/)
    waitUntilAndThen(elemExists, () => {
      // get the video player object
      const element = document.getElementById("movie_player");
      const nodes = element.getElementsByTagName("video");
      let video = nodes[0];

      // when it ends, move to next track
      video.onended = forward;

      pastTenSeconds = () => {
        return video.currentTime > 10;
      };
      restart = () => {
        video.currentTime = 0;
      };

      // change onclick of next and previous buttons on video player ?
      // TODO

      // try to add media key handlers
      tryRepeatedlyForTo(5, addHandlers);
    });
  }

  function soundcloud() {
    function playing() {
      console.log(navigator.mediaSession.playbackState);
      return navigator.mediaSession.playbackState === "playing";
    }

    waitUntilAndThen(playing, () => {
      // watch the progress bar, if it hits max track ended
      const prog = document.querySelector(".playbackTimeline__progressWrapper");
      const endTime = prog.getAttribute("aria-valuemax");

      const reportTimeUpdate = (mutations) => {
        console.log("" + prog.getAttribute("aria-valuenow") + "/" + endTime);
        if (prog.getAttribute("aria-valuenow") == endTime) forward();
      };
      const options = {
        attributes: true,
        attributeFilter: ["aria-valuenow"],
      };

      let observer = new MutationObserver(reportTimeUpdate);
      observer.observe(prog, options);

      pastTenSeconds = () => {
        return prog.getAttribute("aria-valuenow") > 10;
      };
      restart = () => {
        window.location.reload();
      };

      addHandlers();
    });
  }

  function spotify() {
    // todo
    return;
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
})();
