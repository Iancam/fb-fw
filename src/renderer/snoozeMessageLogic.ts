import { getterSetter, actionate, FBResource } from "../common/resources";
import { message } from "facebook-chat-api";
import { ipcRenderer, IpcRenderer } from "electron";
import { useState } from "react";

export type SNOMessage = {
  snoozedAt: Date;
  message: message;
};

const snoozeMessage = (state: getterSetter<SNOMessage[]>) => (
  message: message
) => {
  const datum = { snoozedAt: new Date(), message };
  ipcRenderer.send("POST_SNOOZE_MESSAGE", datum);

  state[1]([...state[0], datum]);
};

const unSnoozeMessage = (state: getterSetter<SNOMessage[]>) => (
  messageID: string
) => {
  ipcRenderer.send("DELETE_SNOOZE_MESSAGE", messageID);
  state[1](state[0].filter(el => el.message.messageID !== messageID));
};

const includes = ([state]: getterSetter<SNOMessage[]>) => (id: string) => {
  return (
    state.filter(({ message: { messageID } }) => messageID === id).length > 0
  );
};

export const useSnoozeMessage = (ipcRenderer: IpcRenderer) => {
  const [initialized, setInitialized] = useState(false);
  const state = useState<SNOMessage[]>([]);
  if (!initialized) {
    ipcRenderer.on(
      "GET_SNOOZE_MESSAGES_RCV",
      (e: Electron.Event, d: SNOMessage[]) => {
        console.log("GET_SNOOZE_THREAD_RCV", d);
        state[1](d);
      }
    );
    ipcRenderer.on(
      "POST_SNOOZE_MESSAGE_RCV",
      (e: Electron.Event, d: SNOMessage[]) => {
        console.log("POST_SNOOZE_THREAD_RCV", "not implemented yet");

        // setSnoozers(d);
      }
    );
    ipcRenderer.send("GET_SNOOZE_MESSAGES");
    setInitialized(true);
  }

  return {
    all: state[0],
    includes: includes(state),
    add: snoozeMessage(state),
    remove: unSnoozeMessage(state)
  };
};
