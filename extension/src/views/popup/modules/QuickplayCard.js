import { useEffect } from "react";
import { Themes } from "../../../themes";

/** a card on the quickplay screen. */
function QuickplayCard({ id, title, theme, onClick }) {
  const selector = `quickplay-${id}`;
  // add hover color as a css style for some reason
  // also add normal color so it doesn't override hover color
  // because element styles override these styles
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      #${selector} {
        background-color: ${Themes[theme].primary};
      }

      #${selector}:hover {
        background-color: ${Themes[theme].primaryDark};
      }
    `;
    document.head.appendChild(style);

    // cleanup: remove style
    return () => document.head.removeChild(style);
  });

  return (
    <div style={{ width: "33.3%" }}>
      <div id={selector} className="quickplay-card" onClick={onClick}>
        <p
          className="title"
          style={{ textAlign: "center", color: Themes[theme].text }}
        >
          {title}
        </p>
      </div>
    </div>
  );
}

export default QuickplayCard;
