import { ReactComponent as Star4 } from "./star4.svg";
import { ReactComponent as Star5 } from "./star5.svg";
import { ReactComponent as Star6 } from "./star6.svg";
import { ReactComponent as Youtube } from "./youtube_logo.svg";
import { ReactComponent as Soundcloud } from "./soundcloud_logo.svg";

export const Icons = {
  STAR4: "star4",
  STAR5: "star5",
  STAR6: "star6",
  YOUTUBE: "youtube",
  SOUNDCLOUD: "soundcloud",
};

export function Icon({ type, size = 20, ...args }) {
  const props = {
    ...args,
    width: size,
    height: size,
  };

  switch (type) {
    case Icons.STAR4:
      return <Star4 {...props} />;
    case Icons.STAR5:
      return <Star5 {...props} />;
    case Icons.STAR6:
      return <Star6 {...props} />;
    case Icons.YOUTUBE:
      return <Youtube {...props} />;
    case Icons.SOUNDCLOUD:
      return <Soundcloud {...props} />;
    default:
      return null;
  }
}
