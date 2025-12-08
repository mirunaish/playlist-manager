import { FUNCTIONS, MessageTypes } from "../../utils";
import { tabService, trackService } from "../services";
import { popup } from "../util";

/** edit track info */
async function editTrack(trackData, tabId = null) {
  // find old track
  const oldTrack = await trackService.getTrackById(trackData.id);

  // edit track
  const editedTrack = await trackService.editTrack(trackData.id, trackData);

  // if tabId was given and url changed, navigate tab to new url
  if (tabId && trackData.url !== oldTrack.url) {
    await tabService.changeTabUrl(tabId, trackData.url);
  }

  // tell popup to update tabs (title and/or artist may have changed)
  popup(MessageTypes.TABS_UPDATE);

  return editedTrack;
}

export const trackRouter = {
  [FUNCTIONS.createTrack]: trackService.createTrack,
  [FUNCTIONS.editTrack]: editTrack,
};
