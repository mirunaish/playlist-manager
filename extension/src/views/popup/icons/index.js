import { useEffect, useRef, useState } from "react";

export const Icons = {
  FILL: "fill",
  STROKE: "stroke",

  LEFT: "left",
  RIGHT: "right",
  PLAY: "play",
  PAUSE: "pause",
  NEXT: "next",
  PREVIOUS: "previous",
  RESTART: "restart",

  STAR4: "star4",
  STAR5: "star5",
  STAR6: "star6",

  YOUTUBE: "youtube",
  SOUNDCLOUD: "soundcloud",
  SPOTIFY: "youtube", // TODO add icon
};

export function Icon({ icon, size = 15, color = null, type = "", ...args }) {
  const SvgRef = useRef(null);
  const [refresh, setRefresh] = useState(0);

  // get icon from file
  useEffect(() => {
    if (!icon) return;
    if (SvgRef.current != null) return;

    (async () => {
      // https://stackoverflow.com/questions/61339259/how-to-dynamically-import-svg-and-render-it-inline
      const ReactComponent = (
        await import("!!@svgr/webpack?-svgo,+titleProp,+ref!./" + icon + ".svg")
      ).default;
      SvgRef.current = ReactComponent;
      setRefresh(refresh + 1); // force a rerender
    })();
  }, [icon, refresh]);

  if (SvgRef?.current == null) return null;

  const Svg = SvgRef.current;

  const props = {
    ...args,
    className: "icon " + (args.className ?? "") + " " + type,
    width: size,
    height: size,
  };
  return <Svg {...props} />;
}
