import { MessageTypes } from "../../consts";

/** get the result of a background function */
export async function background(functionName, ...args) {
  return await browser.runtime.sendMessage({
    type: MessageTypes.FUNCTION_CALL,
    functionName,
    args: args,
  });
}
