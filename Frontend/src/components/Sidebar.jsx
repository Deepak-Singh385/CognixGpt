import "./Sidebar.css";
import { SquarePen } from "lucide-react";
import { CognixContext } from "../Context/Cognix.jsx";
import { useContext, useEffect } from "react";
import { Trash2 } from "lucide-react";

const Sidebar = () => {
  const {
    allThreads,
    setAllThreads,
    currThread,
    setNewChat,
    setPrompt,
    setReply,
    serCurrThread,
    setPrevChats,
    token,
    setToken,
  } = useContext(CognixContext);

  const getAllThreads = async () => {
    try {
      const respones = await fetch("http://localhost:8000/api/thread", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res = await respones.json();
      const filterData = res.map((thread) => {
        return { threadId: thread._id, title: thread.title };
      });
      setAllThreads(filterData);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (token) getAllThreads();
  }, [token]);

  const createNewThread = () => {
    serCurrThread(null); // just reset
    setPrevChats([]);
    setNewChat(true);
    setPrompt("");
  };

  const changeThread = async (newThreadId) => {
    serCurrThread(newThreadId);
    try {
      const response = await fetch(
        `http://localhost:8000/api/thread/${newThreadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const res = await response.json();
      if (Array.isArray(res)) {
        setPrevChats(res);
        setNewChat(false);
      } else {
        console.log("Invalid thread response:", res);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/thread/${threadId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const res = await response.json();
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId),
      );
      if (threadId === currThread) {
        createNewThread();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <section className="sidebar">
      {/* TOP */}
      <div className="sidebar-top">
        <img
          className="logo"
          src="/src/assets/CognixLogo.jpg"
          alt="Cognix Logo"
        />

        <button onClick={createNewThread} className="sidebarBtn">
          <SquarePen size={18} strokeWidth={1.75} />
          <span>New Chat</span>
        </button>
      </div>

      {/* MIDDLE */}
      <ul className="sidebar-history">
        {allThreads.map((thread, idx) => (
          <li key={idx} onClick={(e) => changeThread(thread.threadId)}>
            <span> {thread.title}</span>
            <Trash2
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.threadId);
              }}
              className="trash"
              color="#e14747"
              strokeWidth={2.25}
            />
          </li>
        ))}
      </ul>

      {/* BOTTOM */}
      <div className="sign">
        <p>@CognixGpt</p>
      </div>
    </section>
  );
};

export default Sidebar;
