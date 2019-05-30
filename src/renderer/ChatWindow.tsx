import React from "react";
import { message } from "facebook-chat-api";

const message = (yourID: string) => (
  { body, type, senderID, messageID, threadID }: message,
  i: number
) =>
  type === "message" ? (
    <div
      className={
        (senderID === threadID ? "" : "bg-black-10") + " pa2 avenir tl pr7"
      }
      key={messageID === "tmp" ? messageID + i : messageID}
    >
      <span>{body}</span>
    </div>
  ) : (
    "event"
  );

export default ({
  currentHistory,
  scrollViewDiv,
  endOfMessages,
  yourID
}: {
  currentHistory: message[];
  scrollViewDiv: React.RefObject<HTMLDivElement>;
  endOfMessages: React.RefObject<HTMLDivElement>;
  yourID: string;
}) => {
  return (
    <div
      className="overflow-auto vh-75 flex flex-column-reverse"
      ref={scrollViewDiv}
    >
      <div className="display-none" ref={endOfMessages} />
      {currentHistory.reverse().map(message(yourID))}
    </div>
  );
};
