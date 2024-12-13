import { Themes } from "../../../themes";

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
        <p
          style={{
            textAlign: "center",
            fontSize: 18,
          }}
        >
          {title}
        </p>
      </div>
    </div>
  );
}

export default QuickplayCard;
