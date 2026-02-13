import { useCallback } from "react";
import { FUNCTIONS, MessageTypes } from "../../../../utils";
import Button from "../../components/Button";
import { useListener } from "../../hooks";
import { Icons } from "../../icons";
import { background } from "../../util";
import { useStatusUpdate } from "../../providers/StatusProvider";
import "./LoadablePreviewInput.scss";

function LoadablePreviewInput({
  id,
  attribute = null,
  placeholder = undefined,
  value,
  onChange,
  preview = (value) => <div>{value}</div>,
  tabId = null,
}) {
  const updateStatus = useStatusUpdate();

  const load = useCallback(() => {
    if (!tabId || !attribute || !id) return;

    // ask background for track info.
    void background(FUNCTIONS.guessTrackInfo, tabId, id);

    updateStatus("Loading...");
  }, [id, attribute, tabId, updateStatus]);

  // add listener that adds track info from content script
  useListener(MessageTypes.TRACK_INFO_FORWARD, (payload) => {
    (async () => {
      // if this info wasn't requested by me, ignore it
      if (payload.requesterId !== id) return;

      onChange(payload[attribute]);

      updateStatus("");
    })();
  });

  return (
    <div className="preview-input">
      {preview(value)}
      <input
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className={tabId && attribute ? "" : "end"}
      />
      {tabId && attribute && (
        <Button icon={Icons.PICK} primary onClick={load} className="picker" />
      )}
    </div>
  );
}

export default LoadablePreviewInput;
