import React, { useCallback } from "react";
import Banner from "../../components/Banner/Banner";
import { updateStatus } from "../../../../background_scripts/util";
import { StatusTypes } from "../../../../utils";
import { background, download } from "../../util";
import UploadButton from "../../components/UploadButton";
import "./Settings.scss";
import Button from "../../components/Button";

function Settings() {
  const saveBackup = useCallback(async () => {
    const result = await background("saveBackup");
    const filename = `playlist manager backup ${new Date().toDateString()}.json`;
    download(filename, result);
  }, []);

  const loadBackup = useCallback(async (file) => {
    if (!file) return;
    await background("loadBackup", file);
    updateStatus("backup loaded", StatusTypes.SUCCESS);
  }, []);

  return (
    <div className="page settings-page">
      <Banner />

      <div className="section">
        <h2>Backup</h2>
        <p>Warning: loading a backup will replace all existing data.</p>
        <div className="row">
          <UploadButton onChange={loadBackup} accept=".json">
            Load backup
          </UploadButton>

          <Button primary title="Save backup" onClick={saveBackup} />
        </div>
      </div>
    </div>
  );
}

export default Settings;
