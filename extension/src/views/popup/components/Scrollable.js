import React, { useCallback, useEffect, useRef } from "react";
import { isMouse } from "../../../utils";

/** query selectors need the container and items to have a className */
function Scrollable({
  defaultLast = false,
  horizontal = false,
  selectedItemRef = null,
  selectedItemId = null,
  children,
  style = {},
}) {
  const scrollableDivRef = useRef(null);

  /** enable horizontal scrolling with mouse */
  const scroll = horizontal
    ? (e) => {
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
    : () => {};

  const scrollTo = useCallback((elem) => {
    elem?.scrollIntoView(false);
  }, []);

  // when children are updated, if nothing is selected, scroll to beginning / end
  useEffect(() => {
    // find selected element
    const elem = selectedItemRef?.current;
    const div = scrollableDivRef?.current;
    // no selected element, scroll to start/end
    if (!elem || elem.parentElement !== div) {
      scrollTo(defaultLast ? div?.lastChild : div?.firstChild);
    }
  }, [children, defaultLast, scrollTo, selectedItemId, selectedItemRef]);

  // scroll selected item into view
  useEffect(() => {
    const elem = selectedItemRef?.current;
    const div = scrollableDivRef?.current;
    if (elem && elem?.parentElement === div) {
      scrollTo(elem);
    }
  }, [scrollableDivRef, scrollTo, selectedItemId, selectedItemRef]);

  return (
    <div
      className="scrollable-container"
      ref={scrollableDivRef}
      onWheel={scroll}
      style={style}
    >
      {children}
    </div>
  );
}

export default Scrollable;
