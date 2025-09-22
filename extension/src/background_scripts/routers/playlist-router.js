import { FUNCTIONS } from "../../utils";
import { playlistService } from "../services";

export const playlistRouter = {
  [FUNCTIONS.reshuffle]: playlistService.reshuffle,
  [FUNCTIONS.getPlaylistByTabId]: playlistService.getPlaylistByTabId,
  [FUNCTIONS.previewPlaylist]: playlistService.previewPlaylist,
};
