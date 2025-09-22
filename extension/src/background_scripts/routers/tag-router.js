import { FUNCTIONS } from "../../utils";
import { tagService } from "../services";

export const tagRouter = {
  [FUNCTIONS.getAllTags]: tagService.getAllTags,
  [FUNCTIONS.getTrackTags]: tagService.getTrackTags,
  [FUNCTIONS.createTag]: tagService.createTag,
};
