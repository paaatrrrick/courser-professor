function ChatMessage({ message, isUser, sources }) {

  return (
    <div
      className={`my-1 w-full flex items-center ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-2 flex justify-between min-w-3/4 max-w-5/6 items-center shrink overflow-auto ${
          isUser
            ? "bg-bucksBlue rounded-l-lg rounded-tr-lg"
            : "bg-zinc-500 rounded-r-lg rounded-tl-lg"
        }`}
      >
        <p className="break-words text-white text-md w-full whitespace-no-wrap overflow-hidden">
          {message}
          {sources ? (
            <div className="text-sm flex flex-col items-start">
              <hr className="opacity-50 mt-4" />
              {sources.map((source, i) => (
                <a
                  key={i}
                  className="text-zinc-300 hover:text-zinc-100 transition duration-200 cursor-pointer w-fit"
                  target="_blank"
                  href={source.url}
                >
                  {source.title}
                </a>
              ))}
            </div>
          ) : null}
        </p>
      </div>
    </div>
  );
}

export default ChatMessage;
