import { ipcRenderer, IpcRenderer } from "electron";
import { actionate, getterSetter } from "../common/resources";
import _ from "lodash";
import { updateStored, getNewId } from "../common/utils";
import { actionatePayload, message, thread } from "facebook-chat-api";
import { FBResource } from "../common/resources";
import { Snoozer } from "../common";
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
    body,
    threadID
  ];
  const id = getNewId().toString();
  ipcRenderer.send(
    actionate({ command: "post", resource: FBResource.messages, rec: false }),
    { payload, ctx: { id } }
  );

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

/** @todo implement */
export const snoozeMessage = ({ message, threadID, time }: Snoozer) => () => {
  ipcRenderer.send("snooze", {
    message,
    threadID,
    time
  });
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

  ipcRenderer.send(
    actionate({
      command: "get",
      resource: FBResource.messages,
      rec: false
    }),
    { payload }
  );

  ipcRenderer.send("markAsRead", {
    payload: {
      threadID,
      read: true
    }
  });

  setThreadID(threadID);

  updateStored(threads, { [threadID]: { unreadCount: 0 } });
};
