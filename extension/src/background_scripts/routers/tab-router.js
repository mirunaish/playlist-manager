import { FUNCTIONS, MessageTypes } from "../../utils";
import { tabService, trackService } from "../services";
import { popup } from "../util";

// TODO maybe move this somewhere else
/** get info about a tab playing a tracked track */
async function getTrackByTabUrl(tabId) {
  const tab = await tabService.getTabById(tabId);
  return await trackService.getTrackByUrl(tab.url);
}

// content script listener calls this function to send untracked data
/** send message with untracked info to the popup */
async function insertGuessedInfo(message) {
  const info = message.payload;
  try {
    await popup(MessageTypes.TRACK_INFO_FORWARD, info);
  } catch (e) {
    console.error('failed to insert info "' + JSON.stringify(info) + '";', e);
  }
}

export const tabRouter = {
  [FUNCTIONS.getSupportedTabs]: tabService.getSupportedTabs,
  [FUNCTIONS.getMostImportantTabId]: tabService.getMostImportantTabId,
  [FUNCTIONS.getTabType]: tabService.getTabType,
  [FUNCTIONS.switchToTab]: tabService.switchToTab,
  [FUNCTIONS.guessTrackInfo]: tabService.guessTrackInfo,
  [FUNCTIONS.searchOtherSite]: tabService.searchOtherSite,

  [FUNCTIONS.getTrackByTabUrl]: getTrackByTabUrl,

  [MessageTypes.TRACK_INFO]: insertGuessedInfo,
};
