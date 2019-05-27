import _ from "lodash";
import { useState } from "react";
import { IpcRenderer } from "electron";
import {
  FBAPI,
  command,
  message,
  thread,
  actionatePayload
} from "facebook-chat-api";

export type getterSetter<T> = [T, React.Dispatch<React.SetStateAction<T>>];
export enum FBResource {
  friends = "friends",
  messages = "messages",
  threads = "threads"
}
type mapUseState<T> = {
  [x: string]: getterSetter<T>;
};

type action = {
  command: command;
  resource: FBResource;
  rec: boolean;
};

export const actionate = ({ command, resource, rec }: action) => {
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
        const [threadID, count, before] = payload;
        console.log(payload);

        return new Promise((resolve, reject) => {
          api.getThreadHistory(
            threadID,
            count,
            before,
            (err: any, history: message[]) => {
              if (err) return reject(err);
              console.log({
                last: history[history.length - 1],
                count: history.length,
                before,
                threadID
              });

              resolve(history);
            }
          );
        });
      },
      post: (body: string, threadID: string) => {
        return new Promise((resolve, reject) =>
          api.sendMessage(body, threadID, (err: any, data: any) =>
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

  console.log(states, _.keys(FBResource));

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
        setState(data);
        console.log({ resource, data });
      });
    });
    setInitialized(true);
  }
  return states;
};
