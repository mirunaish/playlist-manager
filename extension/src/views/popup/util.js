import { MessageTypes } from "../../utils";

/** get the result of a background function */
export async function background(functionName, ...args) {
  return await browser.runtime.sendMessage({
    type: MessageTypes.FUNCTION_CALL,
    functionName,
    args,
  });
}

export function closePopup() {
  window.close();
}

// https://stackoverflow.com/a/18197341
export function download(filename, content) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," +
      encodeURIComponent(JSON.stringify(content))
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
