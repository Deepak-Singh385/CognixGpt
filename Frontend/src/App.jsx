import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { CognixContext } from "./Context/Cognix";
import "./App.css";
import { use, useState } from "react";
import Auth from "./components/Auth.jsx";

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThread, serCurrThread] = useState(null);
  const [prevChat, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThread,
    serCurrThread,
    prevChat,
    setPrevChats,
    newChat,
    setNewChat,
    allThreads,
    setAllThreads,
    token,
    setToken,
  };
  return (
    <div className="app">
      <CognixContext.Provider value={providerValues}>
        {token ? (
          <>
            <Sidebar />
            <ChatWindow />
          </>
        ) : (
          <Auth />
        )}
      </CognixContext.Provider>
    </div>
  );
};

export default App;
