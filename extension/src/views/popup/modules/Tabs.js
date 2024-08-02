import React, { useEffect, useState } from "react";
import { isMouse, shorten } from "../../../util";
import { background } from "../util";
import { Themes } from "../../../themes";
import { Pages } from "../../../consts";

function Tab({ tab, selected, onClick, color }) {
  return (
    <div
      onClick={onClick}
      className={"tab" + (selected ? " selected" : "")}
      style={{ backgroundColor: color }}
    >
      <p>{shorten(tab.title ?? "Untitled")}</p>
    </div>
  );
}

function Tabs({ selectedTabId, selectTab }) {
  const [allTabs, setAllTabs] = useState([]); // [{ tab, track, playlist }]

  // ask background script for all supported site tabs in browser
  useEffect(() => {
    (async () => {
      const tabs = await background("getSupportedTabs");
      setAllTabs(tabs);
    })();
  }, []);

  /** enable horizontal scrolling with mouse */
  function scroll(e) {
    // https://stackoverflow.com/questions/68658249/how-to-do-react-horizontal-scroll-using-mouse-wheel
    if (isMouse(e)) {
      const el = e.currentTarget;
      el.scrollTo({
        left: el.scrollLeft + e.deltaY * 3,
        behavior: "smooth",
      });
    }
    // if touchpad, do nothing (default behavior)
  }

  // when tabs are updated, scroll to end if selected tab is + or settings
  useEffect(() => {
    const elem = document.querySelector(".tab.selected");
    const div = document.querySelector(".tabs > .scrollable-container");
    if (!elem || elem.parentElement !== div)
      div.lastChild?.scrollIntoView(false);
  }, [allTabs]);

  // scroll selected tab into view
  useEffect(() => {
    const elem = document.querySelector(".tab.selected");
    const div = document.querySelector(".tabs > .scrollable-container");
    if (elem?.parentElement === div) elem.scrollIntoView(false);
  }, [selectedTabId, allTabs]);

  // TODO change this to callback?
  /**
   * if tab is selected, switch to tab in browser.
   * otherwise, select tab
   */
  async function selectOrSwitch(id) {
    if (id === selectedTabId) {
      await background("switchToTab", id);
    } else {
      selectTab(id);
    }
  }

  const otherTabs = [
    { id: Pages.QUICKPLAY, icon: "⚡", right: false },
    { id: Pages.NEW_MIX, icon: "+", right: false },
    { id: Pages.SEARCH, icon: "🔍", right: false },
    { id: Pages.SETTINGS, icon: "⚙", right: true },
  ];

  // https://stackoverflow.com/questions/21782502/how-to-make-a-divs-width-stretch-between-two-divs
  return (
    <div className="tabs">
      {otherTabs.map(({ id, icon, right }) => (
        <div
          key={id}
          onClick={() => selectTab(id)}
          className={"tab" + (selectedTabId === id ? " selected" : "")}
          style={{ float: right ? "right" : "left" }}
        >
          <p>{icon}</p>
        </div>
      ))}

      <div className="scrollable-container" onWheel={scroll}>
        {allTabs.map((data) => {
          return (
            <Tab
              key={data.tab.id}
              tab={data.tab}
              selected={selectedTabId === data.tab.id}
              onClick={() => selectOrSwitch(data.tab.id)}
              color={Themes[data.theme]?.primary}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Tabs;
