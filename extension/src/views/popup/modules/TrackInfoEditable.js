import { useCallback, useEffect, useState } from "react";
import TrackInfo from "./TrackInfo/TrackInfo";
import { useStatusUpdate } from "../providers/StatusProvider";
import { FUNCTIONS, StatusTypes } from "../../../utils";
import { background } from "../util";

function TrackInfoEditable({
  track,
  big = true,
  showImage = true,
  allowEditingUrl = true,
  showSearch = false,
  actions = [],
  onChange = (updated) => {},
}) {
  const updateStatus = useStatusUpdate();

  const [editing, setEditing] = useState(false);
  const [editingTrackInfo, setEditingTrackInfo] = useState(track);

  // if trackInfo changes or i start/stop editing, reset editingTrackInfo
  useEffect(() => {
    setEditingTrackInfo(track);
  }, [editing, track]);

  useEffect(() => {
    setEditing(false);
  }, [track]);

  const edit = useCallback(async () => {
    updateStatus("editing track...");
    try {
      await background(FUNCTIONS.editTrack, editingTrackInfo);
      updateStatus("track edited", StatusTypes.SUCCESS);

      setEditing(false); // set editing to false

      onChange(editingTrackInfo);
    } catch (e) {
      console.error("failed to edit track", e);
      updateStatus("Track could not be edited", StatusTypes.ERROR);
    }
  }, [editingTrackInfo, onChange, updateStatus]);

  return (
    <TrackInfo
      big={big}
      showImage={showImage}
      track={editing ? editingTrackInfo : track}
      editing={editing}
      updateTrack={(newTrack) =>
        setEditingTrackInfo({ ...editingTrackInfo, ...newTrack })
      }
      showSearch={showSearch && !editing}
      allowEditingUrl={allowEditingUrl}
      actions={[
        ...(editing
          ? [
              { title: "save", primary: true, func: edit },
              { title: "cancel", func: () => setEditing(false) },
            ]
          : [{ title: "edit", func: () => setEditing(true) }]),
        ...actions,
      ]}
    />
  );
}

export default TrackInfoEditable;
