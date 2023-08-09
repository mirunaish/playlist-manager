const allSelectValues = {
  rating: [
    { display: "☆☆☆☆☆", value: "0" },
    { display: "★☆☆☆☆", value: "1" },
    { display: "★★☆☆☆", value: "2" },
    { display: "★★★☆☆", value: "3" },
    { display: "★★★★☆", value: "4" },
    { display: "★★★★★", value: "5" },
  ],
};
const specialFilters = {
  rating: [
    { display: "★★★☆☆+", value: "3+" },
    { value: "", display: "all" },
  ],
  artist: [
    { value: "", display: "all" },
    { value: "star", display: "★" },
    { value: "not star", display: "☆" },
  ],
  sort: [{ value: "shuffle" }],
};
const allInputs = ["id", "title", "artist", "rating", "sort"];

// setup background script
let background = null;
async function initBackground() {
  background = await browser.extension.getBackgroundPage();
  background.setFunctions(load, displayInfo, insertGuessedInfo);
}

// display a message from the background script (log or error)
// will remain visible until click or popup refresh
function displayInfo(message, type) {
  if (message) console.log(message);
  errorContainer = document.getElementById("error-container");
  errorContainer.innerHTML = message;
  errorContainer.classList.add(type);
  errorContainer.classList.remove("hidden");
}

// add/remove css class to/from element
function toggleClass(elementId, cssClass, enabled) {
  if (enabled) document.getElementById(elementId)?.classList.add(cssClass);
  else document.getElementById(elementId)?.classList.remove(cssClass);
}

// hide all views
function resetView() {
  let views = ["nothing", "untracked", "playing"];

  views.forEach((view) => {
    toggleClass(view + "-view", "hidden", true);
  });
}

// add options to all selects
function populateSelects(form) {
  function createOption(select, data) {
    // display is optional, set to value if missing
    const [value, display] = [data.value, data.display ?? data.value];
    let option = document.createElement("option");
    option.value = value;
    option.innerHTML = display;
    select.appendChild(option);
    // if this option should be selected by default, select it
    if (data.selected) select.value = value;
  }

  allInputs.forEach((input) => {
    const id = input + "-" + form;
    const select = document.querySelector("select#" + id);
    if (select) {
      // reset options
      select.innerHTML = "";

      if (form === "filter") {
        // add special filters first
        const filters = specialFilters[input];
        if (filters) {
          filters.forEach((option) => {
            createOption(select, option);
          });
        }
      }

      // add other values
      allSelectValues[input]?.forEach((option) => {
        createOption(select, option);
      });
    }
  });
}

// set initial values in inputs in a form
// TODO double check replace functionality
function setValues(form, values, replace) {
  allInputs.forEach((input) => {
    const field = document.getElementById(input + "-" + form);
    if (field) {
      if (values[input]) field.value = values[input];
      else if (replace) field.value = "";
    }
  });
}

async function setFilterPanel() {
  // is a playlist playing?
  const playing = background.getPlayingInfo().isPlaying;
  const canPlay = playing
    ? false
    : // is something playing in another tab?
      await (async () => {
        const playingTab = await browser.tabs.query({ audible: true });
        return playingTab.length == 0;
      })();

  // load options in filter selects
  populateSelects("filter");

  // get list of artists from database
  let allArtists = null;
  allArtists = await background.getAllArtists();

  allArtists.forEach((artist) => {
    let option = document.createElement("option");
    option.value = artist.id;
    option.innerHTML = artist.name;
    document.getElementById("artist-filter").appendChild(option);
  });

  if (playing) {
    // make selected filters selected
    setValues("filter", background.getPlayingInfo().activeFilters, true);
  }

  // enable/disable all filters
  allInputs.forEach((filter) => {
    toggleClass(filter + "-filter", "noclick", !canPlay);
  });
  toggleClass("start-button", "noclick", !canPlay);

  // show/hide stop/start button
  toggleClass("start-button", "hidden", playing);
  toggleClass("stop-button-div", "hidden", !playing);
}

// received info from page, insert in form
function insertGuessedInfo(payload) {
  setValues("add", payload, false);
}

async function switchToNothingView() {
  // make nothing panel unhidden
  document.getElementById("nothing-view").classList.remove("hidden");
}

async function switchToUntrackedView(currentTab) {
  // make untracked panel unhidden
  document.getElementById("untracked-view").classList.remove("hidden");

  // populate add form selects with options
  populateSelects("add");

  // does this url exist in the database?
  const body = { url: currentTab.url };
  const response = await background.request("/url", { body });

  if (response.ok) {
    let track = response.body;

    // set add form inputs and selects to info from database
    setValues("add", track, true);

    // change add button to say edit instead
    document.getElementById("add-button").innerHTML = "edit";
  } else {
    // determine if site is supported and show a warning if not
    if (!background.siteSupported(currentTab.url)) {
      displayInfo("warning: site is not supported");
    }

    // make sure button says add
    document.getElementById("add-button").innerHTML = "add";
    // remove id if any
    document.getElementById("id-add").value = "";

    // ask page to get title and artist name from video title
    try {
      await browser.tabs.executeScript(currentTab.id, {
        file: "/content_scripts/get_title_and_artist.js",
      });
    } catch (e) {
      console.log(e);
      displayInfo("failed to execute the content script.", "error");
    }
  }
}

async function switchToPlayingView() {
  // populate selects in edit form
  populateSelects("playing");

  // make playing panel unhidden
  document.getElementById("playing-view").classList.remove("hidden");

  const playlist = background.getPlayingInfo().playlist;

  // put playlist length in info box
  const index = background.getPlayingInfo().playingIndex;
  document.getElementById("playlist-time").innerHTML = (() => {
    // todo
    let length = (playlist.length - index) * 3.5 * 60;
    let hours = Math.floor(length / (60 * 60));
    length = length - hours * 60 * 60;
    let minutes = Math.floor(length / 60);
    length = length - minutes * 60;
    if (minutes < 10) minutes = "0" + minutes;
    let seconds = length;
    if (seconds < 10) seconds = "0" + seconds;
    return hours + ":" + minutes + ":" + seconds;
  })();
  document.getElementById("playlist-index").innerHTML =
    index + 1 + "/" + playlist.length;

  // put (part of) playlist in playlist box
  document.getElementById("track-list").innerHTML = ""; // reset list
  document.getElementById("scrolling-div").scrollTop = 0; // scroll div to top

  // goal is to have 25 songs in playlist table
  let start = 0;
  let end = 0;
  if (index < 4) {
    start = 0;
    end = Math.min(25, playlist.length);
  } else if (index > playlist.length - 21) {
    start = Math.max(0, playlist.length - 25);
    end = playlist.length;
  } else {
    start = index - 4;
    end = index + 21;
  }

  for (let i = start; i < end; i++) {
    let track = playlist[i];

    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.id = "track-" + i;
    td.innerHTML = track.artist + " - " + track.title;

    tr.appendChild(td);
    document.getElementById("track-list").appendChild(tr);
  }

  // scroll box to currently playing and highlight it
  let id = "track-" + background.getPlayingInfo().playingIndex;
  let pos = document.getElementById(id).offsetTop - 100;
  document.getElementById("scrolling-div").scrollTop = pos;
  document.getElementById(id).classList.add("selected");

  // put currently playing data in edit form
  const playingTrack = background.getPlayingInfo().playingTrack;
  document.getElementById("title-playing").innerHTML = playingTrack.title;
  document.getElementById("artist-playing").innerHTML = playingTrack.artist;
  allInputs.forEach((input) => {
    let select = document.getElementById(input + "-playing");
    if (select) select.value = playingTrack[input];
  });
}

async function onClick(e) {
  try {
    // undisplay error message
    displayInfo("");
    if (e.target.id === "start-button") {
      await startPlaying();
    } else if (e.target.id === "stop-button") {
      await background.stopPlaying();
    } else if (e.target.id === "list-button") {
      await list();
    } else if (e.target.id === "switch-button") {
      await goToPlayingTab();
    } else if (e.target.id === "edit-button") {
      await edit("playing");
    } else if (e.target.id === "add-button") {
      if (e.target.innerHTML === "add") await add();
      else await edit("add");
    } else if (e.target.id.match(/^track-.*/)) {
      await background.changeTrack(Number(e.target.id.substring(6)));
    } else if (e.target.id === "close-button") {
      window.close();
    }
  } catch (e) {
    console.log(e);
    displayInfo(e, "error");
  }
}

// todo
async function list() {
  return;
}

function gatherValues(form) {
  let values = {};
  allInputs.forEach((input) => {
    let value = document.getElementById(input + "-" + form)?.value;
    if (value?.length > 0) values[input] = value;
  });

  return values;
}

// button
async function startPlaying() {
  // gather filters
  let filters = gatherValues("filter");
  // tell background to start playing
  await background.startPlaying(filters);
}

// submit button for both edit forms
async function edit(form) {
  // gather info from form
  let trackData = gatherValues(form);
  // send to background
  const ok = await background.edit(trackData);
  if (ok) {
    // reload popup with new data. change in playlist box
    await load();
    displayInfo("successfully edited", "success");
  } else displayInfo("could not edit", "error");
}

// submit button for untracked add form
async function add() {
  // gather info from form
  let trackData = gatherValues("add");
  // add url to trackData
  trackData.url = (await background.getActiveTab()).url;

  // send to background
  const ok = await background.add(trackData);
  if (ok) {
    // reload popup (untracked becomes untrackedExceptExists)
    await load();
    displayInfo("successfully added", "success");
  } else displayInfo("could not add", "error");
}

async function goToPlayingTab() {
  const id = background.getPlayingInfo().playingTabId;
  // make tab's window active
  const windowId = (await browser.tabs.get(id)).windowId;
  await browser.windows.update(windowId, { focused: true });
  // make tab active in window
  await browser.tabs.update(id, { active: true });

  // reload popup (load playing view)
  await load();
}

// update popup with correct view and data from backend / tab
async function load() {
  await initBackground();

  // get data from background
  const currentTab = await background.getActiveTab();
  const playingInfo = background.getPlayingInfo();

  await setFilterPanel();

  // determine and load correct view
  resetView();
  // is a playlist playing?
  if (playingInfo.isPlaying) {
    // in this tab?
    if (playingInfo.playingTabId == currentTab.id) {
      await switchToPlayingView();
    } else {
      // playlist is playing in another tab.
      // is something else playing in this tab?
      if (currentTab.audible || background.siteSupported(currentTab.url)) {
        await switchToUntrackedView(currentTab);
      } else {
        // a playlist is playing in another tab, nothing else is playing here
        await switchToPlayingView();
      }
    }
  } else {
    // no playlist is playing.
    // is something playing in this tab?
    if (currentTab.audible || background.siteSupported(currentTab.url)) {
      await switchToUntrackedView(currentTab);
    } else {
      await switchToNothingView();
    }
  }

  // add button event listeners
  document.removeEventListener("click", onClick);
  document.addEventListener("click", onClick);
}

// initial load
(async () => {
  try {
    await load();
  } catch (e) {
    console.log(e);
    displayInfo(e, "error");
  }
})();
