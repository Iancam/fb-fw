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
  scrollTo
} from "./stateLogic";
import ChatWindow from "./ChatWindow";
import Reply from "./Reply";
import { thread, message } from "facebook-chat-api";
import { yourID } from "../common/utils";
import { useMessenStore } from "./messenStore";
import moment from "moment";
import { useSnoozeThread } from "./snoozeThreadLogic";
import { SnoozeLink } from "./SnoozeLink";
import { threadId } from "worker_threads";
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
  const messageList = messages[0] && Object.values(messages[0]);
  const lastMessage = messageList[messageList.length - 1];
  const snooze = (messageId = lastMessage.messageID) => {
    const message = messages && messages[0][messageId];
    snoozed.includes(messageId)
      ? snoozed.remove(messageId)
      : snoozed.add(message);
    console.log(messageId);
  };
  const snoozeTitle = (messageId: string) => {
    return snoozed.includes(messageId) ? "UnSnooze" : "Snooze";
  };
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
            messagesMixin={({ messageID }: message) => (
              <SnoozeLink
                onClick={() => snooze(messageID)}
                title={snoozeTitle(messageID)}
              ></SnoozeLink>
            )}
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
            selectedThread={selectedThread}
          >
            <SnoozeLink
              title={snoozeTitle(lastMessage && lastMessage.messageID)}
              onClick={() => snooze()}
            ></SnoozeLink>
          </SelectedThread>
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
      <div className="vh-100 w-20 fr pa2">
        {snoozed.all.map(
          ({ snoozedAt, message: { threadID, messageID, body } }) => {
            const snoozedThread = {
              ...threads[0][threadID],
              snoozedAt,
              messageID
            };
            return (
              <>
                {ThreadCard({
                  onThreadClick: openThread(
                    ipcRenderer,
                    [selectedThreadID, updateId],
                    threads
                  )
                })(snoozedThread)}
                <span className="i f6 ma0">
                  snoozed {moment(snoozedThread.snoozedAt).fromNow()}:{" "}
                </span>
                <div className="f6 ma0 mw4 truncate">{body}</div>
              </>
            );
          }
        )}
      </div>
    </div>
  );
};
