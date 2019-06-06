import _ from "lodash";
import { useState } from "react";
import { IpcRenderer, ipcRenderer } from "electron";
import {
  FBAPI,
  command,
  message,
  thread,
  actionatePayload
} from "facebook-chat-api";
import { updateStored } from "./utils";
import { Dict } from "../renderer/stateLogic";
import { promisify } from "util";
import { Snoozer } from ".";

export type getterSetter<T> = [T, React.Dispatch<React.SetStateAction<T>>];
export enum FBResource {
  friends = "friends",
  messages = "messages",
  threads = "threads"
}
type mapUseState<T> = {
  [x: string]: getterSetter<T>;
};

export const actionate = (
  command: command,
  resource: FBResource,
  rec: boolean
) => {
  const base = [command, resource].map(x => x.toUpperCase()).join("_");
  return rec ? "RCV_" + base : base;
};

export const resourceToRequest = (api: FBAPI) => {
  return {
    friends: {
      /**
       * @param {(err, success)=>any} cb
       */
      get: (payload: {}) => {
        return new Promise((resolve, reject) => reject("not implemented yet"));
      }
    },
    messages: {
      get: (payload: actionatePayload<"get", FBResource.messages, false>) => {
        return promisify(api.getThreadHistory)(...payload).then(ms =>
          _.keyBy(ms, "messageID")
        );
      },
      post: (payload: actionatePayload<"post", FBResource.messages, false>) => {
        const [body, threadID] = payload;
        console.log(payload);

        return new Promise((resolve, reject) =>
          api.sendMessage(threadID, body, (err: any, data: any) =>
            err ? reject(err) : resolve(data)
          )
        );
      }
    },
    threads: {
      get: () => {
        return new Promise((resolve, reject) => {
          api.getThreadList(20, null, ["INBOX"], (err: any, data: thread[]) =>
            err ? reject(err) : resolve(_.keyBy(data, "threadID"))
          );
        });
      }
    }
  };
};

/**
 * @TODO handle posting case
 * @param ipcRenderer
 */
export const useMessenStore = (ipcRenderer: IpcRenderer) => {
  const [initialized, setInitialized] = useState(false);
  // hooks need to always be in order. We are in a loop here,
  // but the order is invariant to runtime.
  const states: any = _.keys(FBResource)
    .map(resource => ({ resource, state: useState({}) }))
    .reduce((agg: mapUseState<any>, { resource, state }) => {
      agg[resource.toLowerCase()] = state;
      return agg;
    }, {});

  if (!initialized) {
    _.values(FBResource).forEach((resource, i) => {
      const resourceReceived = actionate("get", resource as FBResource, true);
      ipcRenderer.on(resourceReceived, (e: Electron.Event, data: any) => {
        /** @todo handle the case where we need to update, not replace state */
        const [, setState] = states[resource];
        setState(data);
      });
    });
    setInitialized(true);
  }
  return states;
};
