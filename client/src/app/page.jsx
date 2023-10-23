'use client';
import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import { useState, useRef, useEffect } from "react";

import constants from '@/helpers/constants';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

const handleSubmit = async (msg) => {
  const newUserMessage = { text: msg, isUser: true };
  setMessages((prevMessages) => [...prevMessages, newUserMessage]);
  const data = new FormData();
  data.append("prompt", msg);
  const response = await fetch(`${constants.url}/answer`, {
    method: "POST",
    body: data,
  });
  const res = await response.json();
  handleResponse(res.answer); 
  console.log(res);
};

  const handleResponse = (msg) => {
    const botResponse = `This was your last message: '${msg}'`;
    const newBotMessage = { text: botResponse, isUser: false };
    setMessages((prevMessages) => [...prevMessages, newBotMessage]);
  };

  useEffect(() => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <img
        src="/static/images/bucks.png"
        alt="bucks"
        className="w-1/2 md:w-1/4 fixed top-1/3 z-[-10] opacity-40"
      />
      <div className="max-w-3xl w-full flex-1 justify-start items-center flex flex-col overflow-y-scroll px-2 md:px-0 ">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg.text} isUser={msg.isUser} />
        ))}
        <div ref={messagesEndRef} />{" "}
        {/* This empty div acts as a reference to scroll to */}
      </div>
      <ChatInput handleSubmit={handleSubmit} />
    </main>
  );
}
