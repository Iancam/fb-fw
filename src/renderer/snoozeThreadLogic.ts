import { getterSetter, actionate, FBResource } from "../common/resources";
import { message } from "facebook-chat-api";
import { ipcRenderer, IpcRenderer } from "electron";
import { useState } from "react";

type SNOMessage = {
  snoozedAt: Date;
  message: message;
};

const snoozeThread = (state: getterSetter<SNOMessage[]>) => (
  message: message
) => {
  const datum = { snoozedAt: new Date(), message };
  ipcRenderer.send("POST_SNOOZE_THREAD", datum);

  state[1]([...state[0], datum]);
};

const unSnoozeThread = (state: getterSetter<SNOMessage[]>) => (
  messageID: string
) => {
  ipcRenderer.send("DELETE_SNOOZE_THREAD", messageID);
  state[1](state[0].filter(el => el.message.messageID !== messageID));
};

const includes = ([state]: getterSetter<SNOMessage[]>) => (id: string) => {
  return (
    state.filter(({ message: { messageID } }) => messageID === id).length > 0
  );
};

export const useSnoozeThread = (ipcRenderer: IpcRenderer) => {
  const [initialized, setInitialized] = useState(false);
  const state = useState<SNOMessage[]>([]);
  if (!initialized) {
    ipcRenderer.on(actionate("post", FBResource.messages, false), () => {});
    ipcRenderer.on(actionate("post", FBResource.messages, true), () => {});
    ipcRenderer.on(
      "GET_SNOOZE_THREAD_RCV",
      (e: Electron.Event, d: SnoozedThread[]) => {
        console.log("GET_SNOOZE_THREAD_RCV");
      }
    );
    ipcRenderer.on(
      "POST_SNOOZE_THREAD_RCV",
      (e: Electron.Event, d: SnoozedThread[]) => {
        console.log("POST_SNOOZE_THREAD_RCV", "not implemented yet");

        // setSnoozers(d);
      }
    );
    setInitialized(true);
  }

  return {
    all: state[0],
    includes: includes(state),
    add: snoozeThread(state),
    remove: unSnoozeThread(state)
  };
};
