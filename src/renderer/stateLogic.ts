import { ipcRenderer, IpcRenderer } from "electron";
import { actionate, getterSetter } from "../common/resources";
import _ from "lodash";
import { updateStored } from "../common/utils";
import { actionatePayload, message, thread } from "facebook-chat-api";
import { FBResource } from "../common/resources";
import { Snoozer } from "src/common";
export type Dict<T> = { [x: string]: T };

// const sendMessageResponse = (e: Electron.Event, data: message) => {
//   // Only care about updating the temp message we had created if we're still focused on that
//   // thread, otherwise we're gonna re-fetch.
//   if (this.state.selectedThreadID === data.threadID) {
//     let closestSoFar = Number.MAX_VALUE;
//     let closestSoFarIndex = -1;
//     let curMessage = { messageID: "tmp" };
//     for (var i = 0; i < this.state.currentHistory.length; i++) {
//       let diff = Math.abs(
//         this.state.currentHistory[i].timestamp - data.timestamp
//       );
//       if (diff < closestSoFar && curMessage.messageID === "tmp") {
//         closestSoFar = diff;
//         closestSoFarIndex = i;
//       }
//     }

//     let currentHistory = this.state.currentHistory.map((message, i) => {
//       if (closestSoFarIndex === i) {
//         return {
//           ...message,
//           messageID: data.messageID
//         };
//       }

//       return message;
//     });

//     this.setState({ currentHistory });
//   }
// };

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
  messages: getterSetter<Array<message>>;
  chatInput: React.RefObject<HTMLInputElement>;
  yourID: string;
}) => () => {
  if (!chatInput || !chatInput.current) return;
  const body = chatInput.current.value;
  console.log(threadID);
  const payload: actionatePayload<"post", FBResource.messages, false> = [
    threadID,
    body
  ];
  ipcRenderer.send(
    actionate({ command: "post", resource: FBResource.messages, rec: false }),
    payload
  );
  messages[1]([
    ...messages[0],
    {
      threadID,
      messageID: "tmp",
      body,
      type: "message",
      senderID: yourID,
      timestamp: Date.now()
    }
  ]);

  chatInput.current.setAttribute("value", "");
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

export const scrollTo = (end: HTMLDivElement) => {
  end.scrollTo({ behavior: "smooth" });
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
    payload
  );

  ipcRenderer.send("markAsRead", {
    threadID,
    read: true
  });

  setThreadID(threadID);

  updateStored(threads, { [threadID]: { unreadCount: 0 } });
};
