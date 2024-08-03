import React, { useCallback, useEffect, useMemo } from "react";
import { isMouse } from "../../../util";

/** query selectors need the container and items to have a className */
function Scrollable({
  defaultLast = false,
  horizontal = false,
  className,
  itemClassName,
  children,
}) {
  const selectedElement = useMemo(() => {
    return document.querySelector("." + itemClassName + ".selected");
  }, [itemClassName, children]);
  const scrollableDiv = useMemo(() => {
    return document.querySelector("." + className + " > .scrollable-container");
  }, [className, children]);

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
    const elem = selectedElement;
    const div = scrollableDiv;
    if (!elem || elem.parentElement !== div) {
      scrollTo(defaultLast ? div?.lastChild : div?.firstChild);
    }
  }, [children, scrollableDiv, selectedElement, defaultLast, scrollTo]);

  // scroll selected item into view
  useEffect(() => {
    const elem = selectedElement;
    const div = scrollableDiv;
    if (elem && elem?.parentElement === div) scrollTo(elem);
  }, [selectedElement, scrollableDiv, scrollTo]);

  return (
    <div className="scrollable-container" onWheel={scroll}>
      {children}
    </div>
  );
}

export default Scrollable;
