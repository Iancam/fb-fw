import React from "react";

export default ({
  sendMessage,
  chatInput
}: {
  sendMessage: (body: string) => void;
  chatInput: React.RefObject<HTMLInputElement>;
}) => {
  const sendIt = () => {
    if (!chatInput || !chatInput.current) return;
    const body = chatInput.current.value;
    chatInput.current.value = "";
    sendMessage(body);
  };
  return (
    <div className="pb4">
      <input
        ref={chatInput}
        className="w-100 h-100 pa2"
        onKeyPress={e => e.key === "Enter" && sendIt()}
      />
      <button onClick={sendIt}>send</button>
    </div>
  );
};

// const oldRef = el => {
//   this.chatInput = el;
// };
