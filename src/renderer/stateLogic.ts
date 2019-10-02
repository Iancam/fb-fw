import { ipcRenderer, IpcRenderer } from "electron";
import { actionate, getterSetter } from "../common/resources";
import _ from "lodash";
import { updateStored, getNewId } from "../common/utils";
import { actionatePayload, message, thread } from "facebook-chat-api";
import { FBResource } from "../common/resources";

export type Dict<T> = { [x: string]: T };

export const loadNextMessages = (threadId: string, messages: message[]) => {
  messages;
};

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
