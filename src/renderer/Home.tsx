import React, { useState, useEffect, useRef } from "react"; // import { Link } from "react-router-dom";
import { ipcRenderer } from "electron";
import _ from "lodash";
import { getterSetter, actionate, FBResource } from "../common/resources";
import Threads, { ThreadCard } from "./Threads";
import SelectedThread from "./selectedThread";
import {
  openThread,
  markUnread,
  Dict,
  sendMessage,
  scrollTo,
  useSnoozers,
  useSnoozeThread
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
  // const [snoozeVisible, setSnoozeVisible] = useState(false);
  // const [queueVisible, setQueueVisible] = useState(false);
  const snoozed = useSnoozeThread(ipcRenderer);
  const [listening, setListening] = useState(false);
  // const makeSnoozer = useSnoozers(ipcRenderer, messages);
  useEffect(() => {
    if (_.isEmpty(threads[0])) {
      ipcRenderer.send(actionate("get", FBResource.threads, false), {});
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
      <div className="vh-100 w-60 fl pa2">
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
            snoozeTitle={
              snoozed.all.includes(selectedThreadID) ? "UnSnooze" : "Snooze"
            }
            markUnread={markUnread(threads, ipcRenderer, selectedThreadID)}
            snooze={() =>
              snoozed.all.includes(selectedThreadID)
                ? snoozed.remove(selectedThreadID)
                : snoozed.add(selectedThreadID)
            }
            selectedThread={selectedThread}
          />
        )}
        {messages && (
          <Reply
            chatInput={chatInput}
            sendMessage={(body: string) => {
              scrollTo(endOfMessages.current);
              sendMessage({
                selectedThreadID,
                messages,
                yourID
              })(body);
            }}
          />
        )}
      </div>
      <div className="vh-100 w-10 fr pa2">
        {snoozed.all
          .map((threadid: string) => threads[0][threadid])
          .map(
            ThreadCard({
              onThreadClick: id => console.log("nice job breaking this one out")
            })
          )}
      </div>
    </div>
  );
};
