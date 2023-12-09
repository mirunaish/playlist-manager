import React, { useMemo } from "react";
import { Icon, Icons } from "../icons/index";

function PlayBar({ totalTime, currentTime, disabled = false }) {
  const percentage = useMemo(
    () => (currentTime * 100) / totalTime,
    [totalTime, currentTime]
  );

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <p>{currentTime}</p>
        {/* progress bar */}
        <div
          style={{
            width: "300px",
            height: "5px",
            borderRadius: "10px",
            background: "var(--text)",
          }}
        >
          {/* colored in part of progress bar */}
          <div
            style={{
              width: percentage + "%",
              transition: "width 1s",
              height: "100%",
              background: "var(--primary)",
            }}
          />
          {/* knob */}
          <div
            style={{
              background: "var(--primaryDark)",
              width: "10px",
              height: "10px",
              borderRadius: "5px",
            }}
          />
        </div>
        <p>{totalTime}</p>
      </div>

      {/* buttons */}
      <Icon
        icon={Icons.PLAY}
        className="primary"
        onClick={() => {
          // play();
        }}
        size={20}
        type={Icons.FILL}
      />
    </>
  );
}

export default PlayBar;
