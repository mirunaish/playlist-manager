import { Themes } from "../../../../utils";
import "./QuickplayCard.scss";

/** a card on the quickplay screen. */
function QuickplayCard({ id, title, theme, onClick }) {
  return (
    <div
      style={{
        width: "33.3%",
      }}
    >
      <div
        className="quickplay-card"
        onClick={onClick}
        style={{
          backgroundColor: Themes[theme].primary,
          color: Themes[theme].primaryText,
        }}
      >
        <p>{title}</p>
      </div>
    </div>
  );
}

export default QuickplayCard;
