import React from "react";
import { shortenTitle } from "../../../util";

function Tab({ tab, selected, selectTab }) {
  return (
    <div
      onClick={() => selectTab(tab.id)}
      className={"tab" + (selected ? " selected" : "")}
    >
      <p>{shortenTitle(tab.title)}</p>
    </div>
  );
}

function Tabs({ allTabs, selectedTab, selectTab }) {
  return (
    <div className="tabs">
      <div
        onClick={() => selectTab("+")}
        className={"tab" + (selectedTab === "+" ? " selected" : "")}
        style={{ float: "left" }}
      >
        <p>{"+"}</p>
      </div>
      <div
        onClick={() => selectTab("settings")}
        className={"tab" + (selectedTab === "settings" ? " selected" : "")}
        style={{ float: "right" }}
      >
        <p>{"⚙"}</p>
      </div>
      <div
        className="scrollable-container"
        onWheel={(e) => {
          // https://stackoverflow.com/questions/10744645/detect-touchpad-vs-mouse-in-javascript
          if (Number.isInteger(e.deltaY) && e.deltaY !== 0) {
            // mouse
            // https://stackoverflow.com/questions/68658249/how-to-do-react-horizontal-scroll-using-mouse-wheel
            const el = e.currentTarget;
            el.scrollTo({
              left: el.scrollLeft + e.deltaY * 3,
              behavior: "smooth",
            });
            // e.preventDefault();
          }
          // if touchpad, do nothing (default behavior)
        }}
      >
        {allTabs.map((tab) => {
          return (
            <Tab
              key={tab.id}
              tab={tab}
              selected={selectedTab === tab.id}
              selectTab={selectTab}
              color={tab.color}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Tabs;
