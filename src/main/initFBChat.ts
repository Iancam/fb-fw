import { ipcMain, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { resourceToRequest, actionate } from "../common/resources";
import { promisify } from "util";
import { FBAPI, apiHandler, command, FBResource } from "facebook-chat-api";
import login from "facebook-chat-api";

const FBLogin = promisify((login as unknown) as (
  creds: any,
  callback: (error: Error | null | undefined, data: any) => any
) => FBAPI);

const CREDS_DIR = "creds";
const APPSTATE_FN = "appstate.json";
const CREDS_FN = "credentials.json";

const getCreds = () => {
  try {
    const appState = JSON.parse(
      fs.readFileSync(path.join(CREDS_DIR, APPSTATE_FN)).toString()
    );
    return { appState };
  } catch (err) {
    const credentials = JSON.parse(
      fs.readFileSync(path.join(CREDS_DIR, CREDS_FN)).toString()
    );
    return credentials;
  }
};

const glueIpcActionRequestToApi = (resourceToRequest: {
  [x: string]: apiHandler;
}) => {
  ["get", "post"].forEach(commandName => {
    Object.entries(resourceToRequest).forEach(([k, resource]) => {
      const actionTypeParams = {
        command: commandName as command,
        rec: false,
        resource: k as FBResource
      };
      const actionType = actionate(actionTypeParams);
      const handler = resource[commandName];
      if (!handler) {
        console.error(actionType + " not implemented");
        return;
      }
      const fireReceived = (event: Electron.Event) => (data: {
        ctx?: any;
        payload: any;
      }) => {
        return event.sender.send(
          actionate({ ...actionTypeParams, rec: true }),
          data
        );
      };

      ipcMain.on(
        actionType,
        (event: Electron.Event, payload: { payload: any; ctx: any }) =>
          handler(payload)
            .then(fireReceived(event))
            .catch((err: any) => console.error(err))
      );
    });
  });
};

/**
 * grammar looks like COMMAND_RESOURCE
 * eg, GET_CONTACTS
 */

// let dasApi;
export const initFBChat = (window: BrowserWindow) => {
  const creds = getCreds();
  FBLogin(creds).then((api: FBAPI) => {
    glueIpcActionRequestToApi(resourceToRequest(api));
    fs.writeFileSync(
      path.join(CREDS_DIR, APPSTATE_FN),
      JSON.stringify(api.getAppState())
    );

    /**
     * @todo figure out where this snippet should go
     */

    const listen = promisify(api.listen);
    listen().then((message: any) => console.log(message));
  });
};
