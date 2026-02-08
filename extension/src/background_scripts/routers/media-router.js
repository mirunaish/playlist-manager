import { FUNCTIONS, Listeners, MessageTypes, StatusTypes } from "../../utils";
import { mediaService, playlistService, tabService } from "../services";
import { popup, updateStatus } from "../util";

// content script catches next and previous hardware key presses
async function handleMediaMessage(message) {
  // will call next() or previous() on first audible tab that's a playlist
  // (if any)
  // TODO keep track of order in which playlist tabs were played so i can do this
  // 1. in the correct audible tab 2. in the last played one even if it's not audible?
  const affectedTab = await tabService.getFirstAudiblePlaylistTab();
  if (!affectedTab) {
    // if popup is visible, let user know
    updateStatus("No playing playlist found.", StatusTypes.ERROR);
    return;
  }

  if (message.action === "next") {
    mediaService.next(affectedTab.id, { skip: true });
  } else if (message.action === "previous") {
    // if player is in first 10 seconds,
    // tab will restart track instead of sending "previous" message
    mediaService.previous(affectedTab.id);
  }
}

async function onTabDelete(tabId) {
  // if this tab was a playlist, stop playing...
  const playlist = await playlistService.getPlaylistByTabId(tabId);
  if (playlist) {
    await mediaService.stopPlaying(tabId);
    // stopPlaying tells popup to remove tab
    return;
  }

  // otherwise, just let popup know to remove this tab. just in case it was open
  popup(MessageTypes.REMOVE_TAB, { id: tabId });
}

export const mediaRouter = {
  [FUNCTIONS.startPlaying]: mediaService.startPlaying,
  [FUNCTIONS.playTrack]: mediaService.playTrack,
  [FUNCTIONS.next]: mediaService.next,
  [FUNCTIONS.previous]: mediaService.previous,
  [FUNCTIONS.stopPlaying]: mediaService.stopPlaying,

  [MessageTypes.MEDIA_CONTROL]: handleMediaMessage,

  [Listeners.TAB_DELETE]: onTabDelete,
};
