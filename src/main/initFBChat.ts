import { ipcMain, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
// import util from "util";
import {
  resourceToRequest,
  // apiHandler,
  actionate
  // command,
  // FBResource
} from "../common/resources";
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
      const fireReceived = (event: Electron.Event) => (data: any) =>
        event.sender.send(actionate({ ...actionTypeParams, rec: true }), data);
      ipcMain.on(actionType, (event: Electron.Event, payload: {}) =>
        handler(payload)
          .then(fireReceived(event))
          .catch(err => console.error(err))
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

// fbchat(creds, (err, api) => {
//   dasApi = api;
//   if (err) {
//     console.error("fbchat initialization", err);
//   }

// fs.writeFileSync("appstate.json", JSON.stringify(api.getAppState()));
//   api.getThreadHistory("1490007520", 50, null, (err, data) => {
//     if (err) {
//       console.error("getThreadHistory", err);
//       return;
//     }
//     console.log(data);
//   });
// });
//   ipcMain.on("getThreadList", event => {
//     console.log("getThreadList");
//     //   api.getThreadList(20, null, [], (err, data) => {
//     //     if (err) {
//     //       console.error("getThreadList", err);
//     //       return;
//     //     }
//     //     event.sender.send("getThreadListResponse", data);
//     //   });
//   });
//   ipcMain.on("getThreadHistory", (event, args) => {
//     console.log("getThreadHistory");
//     api.getThreadHistory(
//       args.threadID,
//       args.amount,
//       args.timestamp,
//       (err, data) => {
//         if (err) {
//           console.error("getThreadHistory", err);
//           return;
//         }
//         event.sender.send("getThreadHistoryResponse", data);
//       }
//     );
//   });
//   ipcMain.on("sendMessage", (event, args) => {
//     let now = Date.now();
//     console.log("sendMessage", now);
//     api.sendMessage(args.body, args.threadID, (err, data) => {
//       if (err) {
//         console.error("sendMessage", err);
//         return;
//       }
//       console.log("timestamp - now = ", data.timestamp - now);
//       event.sender.send("sendMessageResponse", data);
//     });
//   });
//   ipcMain.on("markAsRead", (event, args) => {
//     console.log("markAsRead");
//     api.markAsRead(args.threadID, args.read, (err, data) => {
//       if (err) {
//         console.error("markAsRead", err);
//         return;
//       }
//       // event.sender.send('sendMessageResponse', data);
//     });
//   });
//   ipcMain.on("listen", (event, args) => {
//     api.listen((err, data) => {
//       if (err) {
//         console.error("listen", err);
//         return;
//       }
//       event.sender.send("message", data);
//     });
//   });
// });
// };
