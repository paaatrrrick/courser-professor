"use client";

function ChatInput({handleSubmit}) {

  const handleChatSubmit = (e) => {
    e.preventDefault();
    const message = e.target.elements.message.value;
    handleSubmit(message);
    e.target.reset();
  }

  return (
    <div className="bg-white w-full flex-col flex justify-center items-center sticky z-10 bottom-0 p-4 max-w-3xl">
      <form className="w-full" onSubmit={handleChatSubmit}>
        <div className="w-full flex justify-center items-center border-bucksBlue border-2 bg-white rounded-xl">
          <input
            type="text"
            placeholder="What is a prokaryote?"
            className="text-zinc-700 p-3 w-full rounded-l-xl focus:outline-none"
            autoFocus
            name="message"
            autoComplete="off"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="none"
            className="text-bucksBlue w-5 h-5 hover:opacity-80 transition duration-200 cursor-pointer mr-2"
            onClick={handleChatSubmit}
          >
            <path
              d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </form>
    </div>
  );
}

export default ChatInput;
