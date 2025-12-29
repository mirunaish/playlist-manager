import { FUNCTIONS } from "../../utils";
import { backupService } from "../services";

export const backupRouter = {
  [FUNCTIONS.saveBackup]: backupService.saveBackup,
  [FUNCTIONS.loadBackup]: backupService.loadBackup,
};
