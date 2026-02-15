import React, { useCallback, useEffect, useRef } from "react";
import "./Scrollable.scss";

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
        e.preventDefault();
        e.currentTarget.scrollLeft += e.deltaY;
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
