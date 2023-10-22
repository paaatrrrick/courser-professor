'use client';
import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import { useState } from "react";

export default function Home() {
  const [userMessages, setUserMessages] = useState([]);
  const [botMessages, setBotMessages] = useState([]);

  const handleSubmit = (msg) => {
    setUserMessages([...userMessages, msg]);
    setTimeout(() => {
      handleResponse(msg);
    }, 500);
  };

  const handleResponse = (msg) => {
    setBotMessages([...botMessages, `This was your last message: '${msg}'`]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <img
        src="/static/images/bucks.png"
        alt="bucks"
        className="w-1/2 md:w-1/4 absolute top-1/3 z-[-10] opacity-40"
      />
      <div className="max-w-3xl w-full h-full flex-1 justify-start items-center flex flex-col">
        {userMessages.map((msg, i) => (
          <ChatMessage key={i} message={msg} isUser={true} />
        ))}
        {botMessages.map((msg, i) => (
          <ChatMessage key={i} message={msg} isUser={false} />
        ))}
      </div>
      <ChatInput handleSubmit={handleSubmit} />
    </main>
  );
}
