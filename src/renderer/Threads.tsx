import React from "react";
import { thread } from "facebook-chat-api";

type threadDeps = {
  onThreadClick: (id: string) => void;
};

export const ThreadCard = ({ onThreadClick }: threadDeps) => ({
  threadID,
  name,
  participants,
  unreadCount
}: thread) => {
  return (
    <a href="#" onClick={() => onThreadClick(threadID)} className="link">
      <div className="pa2" key={threadID} style={{ wordWrap: "break-word" }}>
        {name || participants.map(p => p.name).join(", ")}
      </div>
    </a>
  );
};

export default ({
  list,
  onThreadClick
}: {
  list: thread[];
} & threadDeps) => <div>{list.map(ThreadCard({ onThreadClick }))}</div>;
