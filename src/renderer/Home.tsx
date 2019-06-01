import React, { useState, useEffect, useRef } from "react"; // import { Link } from "react-router-dom";
import { ipcRenderer } from "electron";
import _ from "lodash";
import { getterSetter, actionate, FBResource } from "../common/resources";
import Threads from "./Threads";
import SelectedThread from "./selectedThread";
import {
  openThread,
  markUnread,
  Dict,
  sendMessage,
  scrollTo,
  snoozeMessage
} from "./stateLogic";
import ChatWindow from "./ChatWindow";
import Reply from "./Reply";
import { thread, message } from "facebook-chat-api";
import SnoozeMessage from "./snoozerMessage";
import { yourID } from "../common/utils";
import { useMessenStore } from "./messenStore";
const defaultMessage = "Hey, just checking in! How are are things going?";

export default () => {
  const chatInput = useRef<HTMLInputElement>(null);
  const scrollView = useRef<HTMLDivElement>(null);
  const endOfMessages = useRef<HTMLDivElement>(null);
  const { threads, messages } = useMessenStore(ipcRenderer) as {
    threads: getterSetter<Dict<thread>>;
    messages: getterSetter<Dict<message>>;
  };
  const [selectedThreadID, updateId] = useState("");
  const [snoozeVisible, setSnoozeVisible] = useState(false);
  const [listening, setListening] = useState(false);
  useEffect(() => {
    if (_.isEmpty(threads[0])) {
      ipcRenderer.send(
        actionate({ command: "get", resource: FBResource.threads, rec: false }),
        {}
      );
    }
  });
  useEffect(() => {
    if (!listening) {
      ipcRenderer.send("listen");
      setListening(true);
    }
  });

  const selectedThread = threads[0][selectedThreadID];

  return (
    <div className="cf" data-tid="container">
      <div className="fl fw-700 avenir pa2 w-20 vh-100 overflow-scroll">
        {threads && (
          <Threads
            onThreadClick={openThread(
              ipcRenderer,
              [selectedThreadID, updateId],
              threads
            )}
            list={Object.values(threads[0])}
          />
        )}
      </div>
      <div className="vh-100 w-70 fr pa2">
        {messages && (
          <ChatWindow
            scrollViewDiv={scrollView}
            endOfMessages={endOfMessages}
            yourID={yourID}
            currentHistory={Object.values(messages[0]).sort(
              ({ timestamp: a }, { timestamp: b }) => {
                return a - b;
              }
            )}
          />
        )}
        {threads && selectedThread && (
          <SelectedThread
            markUnread={markUnread(threads, ipcRenderer, selectedThreadID)}
            snooze={() => setSnoozeVisible(snoozeVisible ? false : true)}
            selectedThread={selectedThread}
          />
        )}
        {snoozeVisible && (
          <SnoozeMessage
            defaultMessage={defaultMessage}
            snoozeMessage={(msg, time) =>
              snoozeMessage({ message: msg, timeInHours: time })
            }
          />
        )}
        {messages && (
          <Reply
            reff={chatInput}
            sendMessage={() => {
              sendMessage({
                selectedThreadID,
                messages,
                chatInput,
                yourID
              })();
              scrollTo(endOfMessages.current);
            }}
          />
        )}
      </div>
    </div>
  );
};
