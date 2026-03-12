import "./Sidebar.css";
import { SquarePen, Trash2 } from "lucide-react";
import { CognixContext } from "../Context/Cognix.jsx";
import { useContext, useEffect, useState } from "react";

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

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    threadId: null,
  });

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
    serCurrThread(null);
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
      await response.json();
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

  const handleDeleteClick = (e, threadId) => {
    e.stopPropagation();
    setDeleteModal({ open: true, threadId });
  };

  const confirmDelete = () => {
    deleteThread(deleteModal.threadId);
    setDeleteModal({ open: false, threadId: null });
  };

  const cancelDelete = () => {
    setDeleteModal({ open: false, threadId: null });
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
          <li key={idx} onClick={() => changeThread(thread.threadId)}>
            <span>{thread.title}</span>
            <Trash2
              onClick={(e) => handleDeleteClick(e, thread.threadId)}
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <Trash2 size={20} color="#e14747" strokeWidth={2.25} />
            </div>
            <p className="modal-title">Delete this thread?</p>
            <p className="modal-desc">
              This will permanently remove the thread from your history. This
              action cannot be undone.
            </p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="modal-cancel">
                Cancel
              </button>
              <button onClick={confirmDelete} className="modal-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Sidebar;
