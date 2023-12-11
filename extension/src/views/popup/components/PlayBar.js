import React, { useCallback, useMemo, useState } from "react";
import { Icon, Icons } from "../icons/index";

function PlayBar({ totalTime, currentTime, disabled = false }) {
  const [playing, setPlaying] = useState(false);
  const percentage = useMemo(
    () => (currentTime * 100) / totalTime,
    [totalTime, currentTime]
  );

  const togglePlay = useCallback(() => {
    setPlaying(!playing);
    // TODO tell background to play/pause
  }, [playing]);

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
        icon={Icons.PREVIOUS}
        className="primary"
        onClick={() => {
          //
        }}
        size={20}
        type={Icons.FILL}
      />
      <Icon
        icon={Icons.RESTART}
        className="primary"
        onClick={() => {
          //
        }}
        size={20}
        type={Icons.FILL}
      />
      <Icon
        icon={playing ? Icons.PLAY : Icons.PAUSE}
        className="primary"
        onClick={() => {
          togglePlay();
        }}
        size={20}
        type={Icons.FILL}
      />
      <Icon
        icon={Icons.NEXT}
        className="primary"
        onClick={() => {
          //
        }}
        size={20}
        type={Icons.FILL}
      />
    </>
  );
}

export default PlayBar;
