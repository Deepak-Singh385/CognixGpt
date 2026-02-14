import "./Chat.css";
import { useContext, useEffect, useState } from "react";
import { CognixContext } from "../Context/Cognix";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
const Chat = () => {
  const { newChat, prevChat, reply } = useContext(CognixContext);
  const [latestReply, setLatestReply] = useState(null);

  useEffect(() => {
    if (!reply) return;

    const content = reply.split(" ");
    let idx = 0;

    setLatestReply("");

    const interval = setInterval(() => {
      setLatestReply(content.slice(0, idx + 1).join(" "));
      idx++;

      if (idx >= content.length) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, [reply]);

  return (
    <>
      {newChat && <h1 id="newChatTitle">What’s on the agenda today?</h1>}

      <div className="chats">
        {/* Render previous chats normally */}
        {prevChat?.map((chat, idx) => (
          <div
            className={chat.role === "user" ? "userDiv" : "cognixDiv"}
            key={idx}
          >
            {chat.role === "user" ? (
              <p className="userMessage">{chat.content}</p>
            ) : (
              <Markdown rehypePlugins={[rehypeHighlight]}>
                {chat.content}
              </Markdown>
            )}
          </div>
        ))}

        {/* Render typing animation ONCE at bottom */}
        {latestReply && (
          <div className="cognixDiv">
            <Markdown rehypePlugins={[rehypeHighlight]}>{latestReply}</Markdown>
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;
