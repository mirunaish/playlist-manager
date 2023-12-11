import { useEffect, useState } from "react";

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
  const [Svg, setSvg] = useState(null);

  // get icon from file
  useEffect(() => {
    (async () => {
      const { ReactComponent } = await import("./" + icon + ".svg");
      setSvg(ReactComponent);
    })();
  }, [icon]);

  if (Svg == null) return <p>loading icon</p>;

  const props = {
    ...args,
    className: (args.className ?? "") + " " + type,
    width: size,
    height: size,
  };
  return <Svg {...props} />;
}
