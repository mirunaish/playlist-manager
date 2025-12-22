import { FUNCTIONS } from "../../utils";
import { artistService } from "../services";

export const artistRouter = {
  [FUNCTIONS.getAllArtists]: artistService.getAllArtists,
  [FUNCTIONS.artistMatch]: artistService.artistMatch,
  [FUNCTIONS.createArtist]: artistService.createArtist,
  [FUNCTIONS.getTrackArtists]: artistService.getTrackArtists,
};
