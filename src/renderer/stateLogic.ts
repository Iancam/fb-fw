import { ipcRenderer, IpcRenderer } from "electron";
import { actionate, getterSetter } from "../common/resources";
import _ from "lodash";
import { updateStored, getNewId } from "../common/utils";
import { actionatePayload, message, thread } from "facebook-chat-api";
import { FBResource } from "../common/resources";
import { Snoozer } from "../common";
import { useState } from "react";
import moment from "moment";
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
  chatInput,
  yourID
}: {
  selectedThreadID: string;
  messages: getterSetter<Dict<message>>;
  chatInput: React.RefObject<HTMLInputElement>;
  yourID: string;
}) => () => {
  if (!chatInput || !chatInput.current) return;
  const body = chatInput.current.value;
  const payload: actionatePayload<"post", FBResource.messages, false> = [
    threadID,
    body
  ];
  ipcRenderer.send(actionate("post", FBResource.messages, false), payload);
  const tmp = "tmp" + getNewId();
  updateStored(messages, {
    [tmp]: {
      threadID,
      messageID: tmp,
      body,
      type: "message",
      senderID: yourID,
      timestamp: Date.now()
    }
  });

  chatInput.current.value = "";
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

  ipcRenderer.send(actionate("get", FBResource.messages, false), payload);

  ipcRenderer.send("markAsRead", {
    threadID,
    read: true
  });
  setThreadID(threadID);
  updateStored(threads, { [threadID]: { unreadCount: 0 } });
};

const snoozeMessage = (
  snoozers: Dict<Snoozer> | undefined,
  setSnoozers: React.Dispatch<React.SetStateAction<Dict<Snoozer> | undefined>>
) => (data: Snoozer) => {
  // store the snoozer in case we shut down
  const key = data.threadID;

  if (snoozers && !snoozers[key]) {
    ipcRenderer.send("POST_SNOOZER", data);
  }

  const diff = moment(data.time).diff(moment());
  console.log("dis be snozzled", { data });
  setTimeout(() => {
    // actually post the message
    ipcRenderer.send(actionate("post", FBResource.messages, false), [
      data.threadID,
      data.message
    ]);
    // clear it from storage
    ipcRenderer.send("DELETE_SNOOZER", data);
    if (snoozers) {
      const { [data.threadID]: d, ...newSnoozers } = snoozers;
      console.log(newSnoozers);
      setSnoozers(newSnoozers);
    }
  }, Math.max(diff, 0));
};

/**@todo add snoozers to the app API */
export const useSnoozers = (ipcRenderer: IpcRenderer) => {
  const [initialized, setInitialized] = useState(false);
  const [timers, setTimers] = useState(false);
  const [snoozers, setSnoozers] = useState<Dict<Snoozer> | undefined>(
    undefined
  );
  const localSnoozeMessage = snoozeMessage(snoozers, setSnoozers);
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
  if (!timers && snoozers) {
    console.log(snoozers);

    Object.values(snoozers).forEach(localSnoozeMessage);
    setTimers(true);
  }

  return _.curry((threadID: string, message: string, time: Date) =>
    localSnoozeMessage({ threadID, message, time })
  );
};
