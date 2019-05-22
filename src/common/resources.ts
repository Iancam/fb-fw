import _ from "lodash";

import { Messen } from "messen";
import { useState } from "react";
import { IpcRenderer } from "electron";

export type getterSetter<T> = [T, React.Dispatch<React.SetStateAction<T>>];
export type participant = {
  name: string;
};

export type thread = {
  threadID: string;
  name: string;
  participants: participant[];
  unreadCount: number;
};

export type message = {
  messageID: string;
  timestamp: number;
  body: string | null;
  type: string;
  senderID: string;
  threadID: string;
};

export type friend = {};

export type apiHandler = {
  [resource: string]: (x: any) => any | undefined;
};

export type command = "get" | "post";

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

// const threadForUser = (mes: any, username: string) => {
//   return mes.store.users
//     .getUser({ name: username })
//     .then(({ id, name }: { id: number; name: string }) => {
//       if (!name) throw new Error();
//       return {
//         threadID: id,
//         name
//       };
//     });
// };

export const resourceToRequest = (mes: Messen) => {
  return {
    friends: {
      /**
       * @param {(err, success)=>any} cb
       */
      get: (payload: {}) => {
        return new Promise((resolve, reject) =>
          mes.store.users.me
            ? resolve(mes.store.users.me.friends)
            : reject(undefined)
        );
      }
    },
    messages: {
      get: ({
        threadID,
        count,
        before
      }: {
        threadID: string;
        count: number;
        before: number;
      }) => {
        return new Promise((resolve, reject) => {
          mes.api.getThreadHistory(
            threadID,
            count,
            before,
            (err: any, history: message[]) => {
              if (err) return reject(err);
              resolve(history);

              // mes.store.users.getUsers();
            }
          );
        });
      },
      post: (body: string, threadID: string) => {
        return new Promise((resolve, reject) =>
          mes.api.sendMessage(body, threadID, (err: any, data: any) =>
            err ? reject(err) : resolve(data)
          )
        );
      }
    },
    threads: {
      get: () => {
        return new Promise((resolve, reject) => {
          mes.api.getThreadList(20, null, [], (err: any, data: thread[]) =>
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