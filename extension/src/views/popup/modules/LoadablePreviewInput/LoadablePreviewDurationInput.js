import { formatTime } from "../../../../utils";
import LoadablePreviewInput from "./LoadablePreviewInput";
import "./LoadablePreviewInput.scss";

const MY_REQUESTER_ID = "LoadablePreviewDurationInput";

function LoadablePreviewDurationInput({ duration, setDuration, tabId = null }) {
  return (
    <LoadablePreviewInput
      id={MY_REQUESTER_ID}
      attribute="duration"
      value={duration}
      onChange={(duration) => setDuration(duration)}
      tabId={tabId}
      preview={(duration) => (
        <div className="preview-text">{formatTime(duration)}</div>
      )}
      placeholder="duration in seconds"
    />
  );
}

export default LoadablePreviewDurationInput;
