import { IpcRenderer } from "electron";
import { useState } from "react";
import { getterSetter, actionate } from "../common/resources";
import { Dict } from "./stateLogic";
import { FBResource } from "../common/resources";
import _ from "lodash";

export const useMessenStore = (ipcRenderer: IpcRenderer) => {
  const [initialized, setInitialized] = useState(false);
  const states: { [x: string]: getterSetter<Dict<any>> } = {
    [FBResource.messages]: useState({}),
    [FBResource.threads]: useState({}),
    [FBResource.friends]: useState({})
  };

  if (!initialized) {
    _.values(FBResource).forEach((resource, i) => {
      const resourceReceived = actionate({
        resource: resource as FBResource,
        command: "get",
        rec: true
      });
      ipcRenderer.on(resourceReceived, (e: Electron.Event, data: any) => {
        /** @todo handle the case where we need to update, not replace state */
        const [, setState] = states[resource];
        setState(data.payload);
      });
    });

    const postMessageReceived = actionate({
      resource: FBResource.messages,
      command: "post",
      rec: true
    });
    ipcRenderer.on(
      postMessageReceived,
      (
        e: Electron.Event,
        data: {
          payload: { messageID: string; threadID: string; timestamp: number };
          ctx: { id: string };
        }
      ) => {
        const messages = states[FBResource.messages];
        const messageMatch = messages[data.ctx.id];
        console.log({ messageMatch, messages, states, id: data.ctx.id });

        // updateStored(states.messages, {
        //   [data.payload.messageID]: {
        //     ...messageMatch,
        //     messageID: data.payload.messageID
        //   }
        // });
      }
    );
    setInitialized(true);
  }
  return states;
};
