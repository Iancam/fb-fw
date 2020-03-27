import React from "react";
import { message } from "facebook-chat-api";

const message = (yourID: string) => (
  props: message & { mixin: any; className?: string },
  i: number
) => {
  const { body, type, senderID, messageID, threadID, mixin } = props;
  return type === "message" ? (
    <div className="fl ma2 hide-child">
      <div
        className={
          (senderID === threadID ? "" : "bg-black-10") + " fl w-70 avenir tl"
        }
        key={messageID === "tmp" ? messageID + i : messageID}
      >
        <span>{body}</span>
      </div>
      <div className={"fr"}>{mixin({ ...props, mixin: undefined })}</div>
    </div>
  ) : (
    "event"
  );
};

export default ({
  currentHistory,
  scrollViewDiv,
  endOfMessages,
  yourID,
  messagesMixin,
  className
}: {
  currentHistory: message[];
  scrollViewDiv: React.RefObject<HTMLDivElement>;
  endOfMessages: React.RefObject<HTMLDivElement>;
  yourID: string;
  messagesMixin?: any;
  className?: string;
}) => {
  return (
    <div
      className="overflow-auto vh-75 flex flex-column-reverse"
      ref={scrollViewDiv}
    >
      <div className="display-none" ref={endOfMessages} />
      {currentHistory.reverse().map((p, i) => {
        return message(yourID)({ ...p, mixin: messagesMixin, className }, i);
      })}
    </div>
  );
};
