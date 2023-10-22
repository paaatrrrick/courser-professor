import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

function ChatMessage({ message, isUser }) {

    const [copied , setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 1000);
    }

    return (
      <div
        className={`w-full flex justify-center items-center ${
          isUser ? "bg-bucksBlue" : "bg-zinc-500"
        }`}
      >
        <div className={`p-4 text-white text-md w-full`}>{message}</div>
        {!isUser ? (
          copied ? (
            <FontAwesomeIcon
              icon={faCheck}
              className={`text-lg text-white cursor-pointer mr-2 hover:opacity-80 transition duration-200 ${
                isUser ? "bg-bucksBlue" : "bg-zinc-500"
              }`}
            />
          ) : (
            <FontAwesomeIcon
              icon={faCopy}
              className={`text-lg text-white cursor-pointer mr-2 hover:opacity-80 transition duration-200 ${
                isUser ? "bg-bucksBlue" : "bg-zinc-500"
              }`}
              onClick={copyToClipboard}
            />
          )
        ): null}
      </div>
    );
}

export default ChatMessage;
