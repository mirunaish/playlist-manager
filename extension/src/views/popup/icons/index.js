import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaPlay,
  FaPause,
  FaMagnifyingGlass,
  FaForwardStep,
  FaBackwardStep,
  FaYoutube,
  FaSoundcloud,
  FaSpotify,
  FaThumbtack,
  FaShuffle,
  FaGear,
  FaPlus,
  FaBolt,
  FaStop,
  FaRightToBracket,
  FaEyeDropper,
} from "react-icons/fa6";
import { FaUndo } from "react-icons/fa";

export const Icons = {
  LEFT: "left",
  RIGHT: "right",

  PLAY: FaPlay,
  PAUSE: FaPause,
  STOP: FaStop,
  FINISH: FaRightToBracket,
  NEXT: FaForwardStep,
  PREVIOUS: FaBackwardStep,
  RESTART: FaUndo,

  SEARCH: FaMagnifyingGlass,
  SETTINGS: FaGear,
  PLUS: FaPlus,
  LIGHTNING: FaBolt,
  PIN: FaThumbtack,
  SHUFFLE: FaShuffle,
  PICK: FaEyeDropper,

  YOUTUBE: FaYoutube,
  SOUNDCLOUD: FaSoundcloud,
  SPOTIFY: FaSpotify,
};

export function Icon({
  icon, // name or function...
  size = 15,
  color = "", // primary or secondary
  ...args // style, className, onClick etc
}) {
  const isFaIcon = useMemo(() => typeof icon !== "string", [icon]);

  // ref for custom svg icon
  const SvgRef = useRef(null);
  const [refresh, setRefresh] = useState(0); // need this to force rerender

  // if custom icon, get icon from file
  useEffect(() => {
    if (!icon) return;
    if (isFaIcon) return;
    if (SvgRef.current != null) return; // already loaded

    (async () => {
      // https://stackoverflow.com/questions/61339259/how-to-dynamically-import-svg-and-render-it-inline
      const ReactComponent = (
        await import("!!@svgr/webpack?-svgo,+titleProp,+ref!./" + icon + ".svg")
      ).default;
      SvgRef.current = ReactComponent;
      setRefresh(refresh + 1); // force a rerender
    })();
  }, [icon, isFaIcon, refresh]);

  if (!icon) {
    console.error("icon not found:", icon);
    return null;
  }

  // if icon function (probably fontawesome), render that
  if (isFaIcon) {
    const FaIcon = icon;
    return (
      <FaIcon
        {...args}
        className={"icon " + (args.className ?? "") + " " + color}
        size={size}
      />
    );
  }

  // otherwise, render custom svg if loaded
  if (SvgRef?.current) {
    const Svg = SvgRef.current;
    return (
      <Svg
        {...args}
        className={"icon " + (args.className ?? "") + " " + color}
        width={size}
        height={size}
      />
    );
  }
}
