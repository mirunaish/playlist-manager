import React, { useCallback } from "react";

function UploadButton({ onChange, type = "", accept, children }) {
  const onSelectFiles = useCallback(
    (event) => {
      const files = event.target.files;

      if (!files || files.length <= 0 || files.length > 1) {
        onChange?.(null);
        return;
      }

      onChange?.(files[0]);
    },
    [onChange]
  );

  return (
    <>
      <label htmlFor="upload" className={`button wide ${type}`}>
        {children ?? "Choose files"}
      </label>

      <input
        type="file"
        onChange={onSelectFiles}
        id="upload"
        style={{ display: "none" }}
        accept={accept}
      />
    </>
  );
}

export default UploadButton;
