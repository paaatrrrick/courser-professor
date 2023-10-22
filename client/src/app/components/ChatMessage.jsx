function ChatMessage({ message, isUser }) {

  return (
    <div
      className={`my-1 w-full flex items-center ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-2 flex justify-between min-w-3/4 items-center ${
          isUser ? "bg-bucksBlue rounded-l-lg" : "bg-zinc-500 rounded-r-lg"
        }`}
      >
        <p className="break-words text-white text-md w-full">{message}</p>
      </div>
    </div>
  );
}

export default ChatMessage;
