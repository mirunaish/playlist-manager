import React, { useCallback, useMemo, useState } from "react";
import { Icon, Icons } from "../icons/index";
import { BORDER_STYLE, formatTime } from "../../../utils";

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderTop: BORDER_STYLE,
        marginTop: 5,
        padding: 10,
        paddingBottom: 20,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "90%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 15,
        }}
      >
        <p>{formatTime(currentTime)}</p>

        {/* progress bar */}
        <div
          style={{
            flexGrow: 1,
            height: "5px",
            borderRadius: "10px",
            background: "var(--text)",
            overflow: "visible",

            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* colored in part of progress bar */}
          <div
            style={{
              borderRadius: "10px 0px 0px 10px",
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

              position: "relative",
              left: "-5px",
            }}
          />
        </div>

        <p>{formatTime(totalTime)}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "row" }}>
        {/* buttons */}
        <Icon
          icon={Icons.PREVIOUS}
          color="primary"
          onClick={() => {
            //
          }}
          size={20}
        />
        <Icon
          icon={Icons.RESTART}
          color="primary"
          onClick={() => {
            //
          }}
          size={20}
        />
        <Icon
          icon={playing ? Icons.PLAY : Icons.PAUSE}
          color="primary"
          onClick={() => {
            togglePlay();
          }}
          size={20}
        />
        <Icon
          icon={Icons.NEXT}
          color="primary"
          onClick={() => {
            //
          }}
          size={20}
        />
      </div>
    </div>
  );
}

export default PlayBar;
