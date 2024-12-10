import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { isMouse, shorten } from "../../../util";
import { background } from "../util";
import { Themes } from "../../../themes";
import { MessageTypes, Pages } from "../../../consts";
import Scrollable from "../components/Scrollable";
import { useListener } from "../hooks";

const Tab = forwardRef(({ tab, selected, onClick, color }, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={"tab" + (selected ? " selected" : "")}
      style={{ backgroundColor: color }}
    >
      <p>{shorten(tab.title ?? "Untitled")}</p>
    </div>
  );
});

function Tabs({ selectedTabId, selectTab }) {
  const [allTabs, setAllTabs] = useState([]); // [{ tab, track, playlist }]
  const selectedTabRef = useRef(null);

  /** ask background script for all supported site tabs in browser */
  const askBackgroundForTabs = useCallback(async () => {
    const tabs = await background("getSupportedTabs");
    setAllTabs(tabs);
  }, []);

  // ask once at first render
  useEffect(() => {
    askBackgroundForTabs();
  }, []);

  // listen for background telling me that tabs have updated
  useListener(MessageTypes.TABS_UPDATE, () => {
    askBackgroundForTabs();
  });

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
          ref={(element) => {
            if (selectedTabId === id) selectedTabRef.current = element;
          }}
          key={id}
          onClick={() => selectTab(id)}
          className={"tab" + (selectedTabId === id ? " selected" : "")}
          style={{ float: right ? "right" : "left" }}
        >
          <p>{icon}</p>
        </div>
      ))}

      <Scrollable
        horizontal={true}
        selectedItemRef={selectedTabRef}
        selectedItemId={selectedTabId}
        defaultLast={true}
      >
        {allTabs.map((data) => {
          return (
            <Tab
              key={data.tab.id}
              tab={data.tab}
              selected={selectedTabId === data.tab.id}
              ref={(element) => {
                if (selectedTabId === data.tab.id)
                  selectedTabRef.current = element;
              }}
              onClick={() => selectOrSwitch(data.tab.id)}
              color={Themes[data.playlist?.theme]?.primary}
            />
          );
        })}
      </Scrollable>
    </div>
  );
}

export default Tabs;
