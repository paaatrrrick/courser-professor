"use client";
import { useState } from "react";
import ChatInput from "../components/ChatInput.jsx";

function Chat() {
  const [hasChatStarted, setHasChatStarted] = useState(false);

  return (
    <div className="flex flex-col justify-center flex-1 w-full outline items-center">
      {!hasChatStarted ? <h1 className="text-3xl font-bold">Courser</h1> : null}
      <ChatInput />
    </div>
  );
}

export default Chat;
