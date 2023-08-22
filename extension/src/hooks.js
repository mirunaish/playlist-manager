import { useMemo } from "react";

export function useBackground() {
  // background page probably never changes
  const background = useMemo(() => {
    console.log("getting background");
    return browser.extension.getBackgroundPage();
  }, []);

  return background;
}
