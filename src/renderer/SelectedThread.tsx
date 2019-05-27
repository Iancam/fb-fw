import React from "react";
import { thread } from "facebook-chat-api";

export default ({
  selectedThread,
  markUnread,
  snooze
}: {
  selectedThread: thread;
  markUnread: () => void;
  snooze: (...params: any) => void;
}) =>
  selectedThread ? (
    <div className="dib">
      <a href="#" className="dib pa2 link avenir" onClick={markUnread}>
        <div style={{ cursor: "pointer" }}>Mark as unread</div>{" "}
      </a>
      <div className="dib pa2 fw-700">{selectedThread.name}</div>
      <a href="#" className="dib pa2 link avenir" onClick={snooze}>
        <div style={{ cursor: "pointer" }}>Snooze</div>
      </a>
    </div>
  ) : null;
