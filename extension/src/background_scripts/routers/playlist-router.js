import { FUNCTIONS } from "../../utils";
import { playlistService } from "../services";

export const playlistRouter = {
  [FUNCTIONS.reshuffle]: playlistService.reshuffle,
  [FUNCTIONS.getPlaylist]: playlistService.getPlaylist,
};
