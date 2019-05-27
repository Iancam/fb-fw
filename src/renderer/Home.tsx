import React, { useState, useEffect, useRef } from "react"; // import { Link } from "react-router-dom";
import { ipcRenderer } from "electron";
import _ from "lodash";
import { useMessenStore, getterSetter } from "../common/resources";
import Threads from "./Threads";
import SelectedThread from "./selectedThread";
import {
  openThread,
  markUnread,
  snooze,
  Dict,
  sendMessage,
  scrollTo
} from "./stateLogic";
import ChatWindow from "./ChatWindow";
import Reply from "./Reply";
import { thread, message } from "facebook-chat-api";
const yourID = "100009069356507";

export default () => {
  const chatInput = useRef<HTMLInputElement>(null);
  const scrollView = useRef<HTMLDivElement>(null);
  const endOfMessages = useRef<HTMLDivElement>(null);
  const { threads, messages } = useMessenStore(ipcRenderer) as {
    threads: getterSetter<Dict<thread>>;
    messages: getterSetter<Dict<message>>;
  };
  const [selectedThreadID, updateId] = useState("");
  const [listening, setListening] = useState(false);
  useEffect(() => {
    if (_.isEmpty(threads[0])) {
      ipcRenderer.send("GET_THREADS");
    }
  });
  useEffect(() => {
    if (!listening) {
      ipcRenderer.send("listen");
      setListening(true);
    }
  });
  endOfMessages.current && scrollTo(endOfMessages.current);
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
            currentHistory={Object.values(messages[0])}
          />
        )}
        {threads && selectedThread && (
          <SelectedThread
            markUnread={markUnread(threads, ipcRenderer, selectedThreadID)}
            snooze={snooze}
            selectedThread={selectedThread}
          />
        )}
        {messages && (
          <Reply
            reff={chatInput}
            sendMessage={sendMessage({
              selectedThreadID,
              messages,
              chatInput,
              yourID
            })}
          />
        )}
      </div>
    </div>
  );
};
