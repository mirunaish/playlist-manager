import React, { useCallback, useMemo, useState } from "react";
import { Icon, Icons } from "../../icons/index";
import { BORDER_STYLE, formatTime } from "../../../../utils";
import "./PlayBar.scss";

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
    <div className="play-bar" style={{ borderTop: BORDER_STYLE }}>
      <div className="progress-container">
        <p>{formatTime(currentTime)}</p>

        {/* progress bar */}
        <div className="progress-bar">
          {/* colored in part of progress bar */}
          <div className="progress-fill" style={{ width: percentage + "%" }} />
          {/* knob */}
          <div className="knob" />
        </div>

        <p>{formatTime(totalTime)}</p>
      </div>

      <div className="buttons-row">
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
