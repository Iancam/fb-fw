import { ipcRenderer, IpcRenderer } from "electron";
import { actionate, getterSetter } from "../common/resources";
import _ from "lodash";
import { updateStored } from "../common/utils";
import { actionatePayload, message, thread } from "facebook-chat-api";
import { FBResource } from "../common/resources";
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
  messages: getterSetter<Dict<message>>;
  chatInput: React.RefObject<HTMLInputElement>;
  yourID: string;
}) => () => {
  if (!chatInput || !chatInput.current) return;
  const body = chatInput.current.value;

  ipcRenderer.send(
    actionate({ command: "post", resource: FBResource.messages, rec: false }),
    {
      threadID,
      body: chatInput.current.value
    },
    { body }
  );

  updateStored(messages, {
    tmp: {
      threadID,
      messageID: "tmp",
      body,
      type: "message",
      senderID: yourID,
      timestamp: Date.now()
    }
  });

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
export const snooze = (t: thread) => () => {
  console.log("will snooze " + t);
};

export const scrollTo = (end: HTMLDivElement) => {
  end.scrollTo({ behavior: "smooth" });
};

// componentDidMount() {
//   this.scrollToBottom();

// }

// componentDidUpdate() {
//   this.scrollToBottom();
// }
// sendApproval(): void {
//   ipcRenderer.send("loginApprovalResponse", this.state.loginApproval);

//   // throw new Error("Method not implemented.");
// }

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
  console.log(threads[0][threadID]);

  setThreadID(threadID);

  updateStored(threads, { [threadID]: { unreadCount: 0 } });
};
