import { ipcRenderer, IpcRenderer } from "electron";
import { actionate, getterSetter } from "../common/resources";
import _ from "lodash";
import { updateStored, getNewId } from "../common/utils";
import { actionatePayload, message, thread, threadID } from "facebook-chat-api";
import { FBResource } from "../common/resources";
import { Snoozer } from "../common";
import { useState } from "react";
import moment from "moment";
import { yourID } from "../common/utils";
export type Dict<T> = { [x: string]: T };

export const loadNextMessages = (threadId: string, messages: message[]) => {
  messages;
};

/**
 * @todo refactor chat input to be a value. this layer should be interchangeable
 * with any presentational component
 */
export const sendMessage = ({
  selectedThreadID: threadID,
  messages,
  yourID
}: {
  selectedThreadID: string;
  messages: getterSetter<Dict<message>>;
  yourID: string;
}) => (body: string) => {
  const payload: actionatePayload<"post", FBResource.messages, false> = [
    body,
    threadID
  ];
  const id = getNewId().toString();
  ipcRenderer.send(actionate("post", FBResource.messages, false), {
    payload,
    ctx: { id }
  });
  const tmpMessage = {
    [id]: {
      threadID,
      messageID: id,
      body,
      type: "message",
      senderID: yourID,
      timestamp: Date.now()
    }
  };
  updateStored(messages, tmpMessage);
};

export const markUnread = (
  threads: getterSetter<Dict<thread>>,
  ipcRenderer: IpcRenderer,
  selectedThreadID: string
) => () => {
  ipcRenderer.send("markAsRead", {
    threadID: selectedThreadID,
    read: false
  });

  updateStored(threads, { [selectedThreadID]: { unreadCount: 1 } });
};

export const scrollTo = (end?: HTMLDivElement | null) => {
  end && end.scrollIntoView({ behavior: "smooth" });
};

export const openThread = (
  ipcRenderer: IpcRenderer,
  [, setThreadID]: getterSetter<string>,
  threads: getterSetter<Dict<thread>>
) => (threadID: string) => {
  const payload: actionatePayload<"get", FBResource.messages, false> = [
    threadID,
    50,
    null
  ];

  ipcRenderer.send(actionate("get", FBResource.messages, false), { payload });

  ipcRenderer.send("markAsRead", {
    payload: {
      threadID,
      read: true
    }
  });
  setThreadID(threadID);
  updateStored(threads, { [threadID]: { unreadCount: 0 } });
};

const snoozeMessage = (
  messages: getterSetter<Dict<message>>,
  snoozers: getterSetter<Dict<Snoozer> | undefined>
) => (data: Snoozer) => {
  // store the snoozer in case we shut down
  const key = data.threadID;
  if (snoozers[0] && !snoozers[0][key]) {
    ipcRenderer.send("POST_SNOOZER", data);
  }
};

const snoozeThread = (threads: getterSetter<threadID[]>) => (
  data: threadID
) => {
  ipcRenderer.send("POST_SNOOZE_THREAD", data);
  threads[1]([...threads[0], data]);
};
const unSnoozeThread = (threads: getterSetter<threadID[]>) => (
  data: threadID
) => {
  ipcRenderer.send("DELETE_SNOOZE_THREAD", data);
  threads[1](threads[0].filter(el => el !== data));
};

export const useSnoozeThread = (ipcRenderer: IpcRenderer) => {
  const [initialized, setInitialized] = useState(false);
  const state = useState<threadID[]>([]);
  if (!initialized) {
    ipcRenderer.on(
      "GET_SNOOZE_THREAD_RCV",
      (e: Electron.Event, d: Dict<Snoozer>) => {
        console.log("GET_SNOOZE_THREAD_RCV");
      }
    );
    ipcRenderer.on(
      "POST_SNOOZE_THREAD_RCV",
      (e: Electron.Event, d: Dict<Snoozer>) => {
        console.log("POST_SNOOZE_THREAD_RCV", "not implemented yet");

        // setSnoozers(d);
      }
    );
    setInitialized(true);
  }
  return {
    all: state[0],
    add: snoozeThread(state),
    remove: unSnoozeThread(state)
  };
};

/**@todo add snoozers to the app API */
export const useSnoozers = (
  ipcRenderer: IpcRenderer,
  messages: getterSetter<Dict<message>>
) => {
  const [initialized, setInitialized] = useState(false);
  const [snoozers, setSnoozers] = useState<Dict<Snoozer> | undefined>(
    undefined
  );
  const localSnoozeMessage = snoozeMessage(messages, [snoozers, setSnoozers]);
  if (!initialized) {
    ipcRenderer.on(
      "GET_SNOOZERS_RCV",
      (e: Electron.Event, d: Dict<Snoozer>) => {
        setSnoozers(d);
      }
    );
    ipcRenderer.on(
      "POST_SNOOZER_RCV",
      (e: Electron.Event, d: Dict<Snoozer>) => {
        console.log("not implemented yet");

        // setSnoozers(d);
      }
    );
    ipcRenderer.send("GET_SNOOZERS");
    setInitialized(true);
  }
  if (snoozers) {
    Object.values(snoozers).forEach(localSnoozeMessage);
  }

  return _.curry((threadID: string, message: string, time: Date) =>
    localSnoozeMessage({ threadID, message, time })
  );
};
