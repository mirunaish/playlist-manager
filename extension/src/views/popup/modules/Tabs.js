import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { shorten } from "../../../util";
import { background } from "../util";
import { Themes } from "../../../themes";
import { MessageTypes, Pages } from "../../../consts";
import Scrollable from "../components/Scrollable";
import { useListener } from "../hooks";
import { Icon, Icons } from "../icons";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // listen for background telling me that tabs have updated
  useListener(MessageTypes.TABS_UPDATE, () => {
    askBackgroundForTabs();
  });
  // listen for background telling me to remove a tab
  useListener(MessageTypes.REMOVE_TAB, ({ id }) => {
    setAllTabs(allTabs.filter(({ tab }) => tab.id !== id));
    // if the tab closed was selected, switch to default tab
    if (selectedTabId === id) selectTab(Pages.DEFAULT);
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
    { id: Pages.QUICKPLAY, icon: { icon: Icons.LIGHTNING }, right: false },
    { id: Pages.NEW_MIX, icon: { icon: Icons.PLUS }, right: false },
    { id: Pages.SEARCH, icon: { icon: Icons.SEARCH }, right: false },
    { id: Pages.SETTINGS, icon: { icon: Icons.SETTINGS }, right: true },
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
          <Icon {...icon} size={14} />
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
