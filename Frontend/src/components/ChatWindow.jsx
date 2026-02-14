import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { ChevronDown } from "lucide-react";
import { CircleUserRound } from "lucide-react";
import { Send } from "lucide-react";
import { CognixContext } from "../Context/Cognix.jsx";
import { useContext, useEffect, useState } from "react";
import { ScaleLoader } from "react-spinners";
import jwtDecode from "jwt-decode";
import { X } from "lucide-react";

const ChatWindow = () => {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThread,
    prevChat,
    setPrevChats,
    setNewChat,
    token,
    serCurrThread,
    setToken,
  } = useContext(CognixContext);
  const [loader, setLoader] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email || "User");
      } catch (err) {
        console.error("Token decode error:", err);
        localStorage.removeItem("token");
        setToken(null);
      }
    }
  }, [token, setToken]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(false);
    };

    if (showMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showMenu]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setShowMenu(false);
  };

  const getReply = async () => {
    // Check if user is logged in
    if (!token) {
      setShowLoginAlert(true);
      // Auto-hide alert after 4 seconds
      setTimeout(() => setShowLoginAlert(false), 4000);
      return;
    }

    // Validate token
    try {
      jwtDecode(token);
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      setToken(null);
      setShowLoginAlert(true);
      return;
    }

    if (!prompt.trim()) {
      return;
    }

    const userMessage = { role: "user", content: prompt };

    setPrevChats((prev) => [...prev, userMessage]);
    setNewChat(false);
    setLoader(true);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThread,
      }),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/thread`,
        options,
      );

      // Check if response is ok
      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - token expired or invalid
          localStorage.removeItem("token");
          setToken(null);
          setShowLoginAlert(true);
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const res = await response.json();

      if (res.error) {
        throw new Error(res.error);
      }

      if (!currThread && res.threadId) {
        serCurrThread(res.threadId);
      }

      const assistantMessage = {
        role: "assistant",
        content: res.reply || "No response received",
      };

      setPrevChats((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      // Add error message to chat
      const errorMessage = {
        role: "assistant",
        content: `⚠️ Error: ${err.message || "Failed to get response. Please try again."}`,
      };
      setPrevChats((prev) => [...prev, errorMessage]);
    } finally {
      setPrompt("");
      setLoader(false);
    }
  };

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span>
          CognixGpt <ChevronDown />
        </span>

        <div className="userIconDiv">
          <div
            className="userIcon"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title={token ? `Logged in as ${userEmail}` : "Click to login"}
          >
            <CircleUserRound color="#339cff" strokeWidth={1.5} />
          </div>

          {showMenu && token && (
            <div className="userDropdown">
              <p className="userEmail">{userEmail}</p>
              <hr />
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <Chat></Chat>
      <ScaleLoader color="#fff" size={12} loading={loader} />

      {/* Login Alert */}
      {showLoginAlert && (
        <div className="loginAlert">
          <div className="loginAlertContent">
            <span className="alertIcon">🔐</span>
            <p>
              Please <strong>login first</strong> to use CognixGpt
            </p>
            <button
              className="alertCloseBtn"
              onClick={() => setShowLoginAlert(false)}
              aria-label="Close alert"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="chatInput">
        <div className="inputBox">
          <input
            type="text"
            placeholder={token ? "Ask Anything" : "Please login to ask..."}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                getReply();
              }
            }}
            disabled={!token || loader}
            className={!token ? "inputDisabled" : ""}
            aria-label="Chat input"
          />
          <div
            id="submit"
            onClick={getReply}
            className={!token ? "submitDisabled" : ""}
            title={
              !token ? "Please login to send messages" : "Send message (Enter)"
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                getReply();
              }
            }}
          >
            <Send />
          </div>
        </div>
        <p className="info">
          Cognix can make mistakes. Check important info. See
          <span onClick={() => setShowModal(true)} role="button" tabIndex={0}>
            {" "}
            Cookie References
          </span>
        </p>
      </div>

      {/* Cookie References Modal */}
      {showModal && (
        <div className="modalOverlay" onClick={() => setShowModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>Cookie References & Privacy</h2>
              <button
                className="closeBtn"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="modalBody">
              <section>
                <h3>About Cookies</h3>
                <p>
                  Cookies are small data files stored on your device that help
                  us provide a better experience. We use cookies to:
                </p>
                <ul>
                  <li>Remember your preferences and login information</li>
                  <li>Track your usage patterns to improve our service</li>
                  <li>Deliver personalized content and recommendations</li>
                  <li>Analyze site performance and user behavior</li>
                </ul>
              </section>

              <section>
                <h3>Types of Cookies We Use</h3>
                <ul>
                  <li>
                    <strong>Session Cookies:</strong> Temporary cookies that
                    expire when you close your browser
                  </li>
                  <li>
                    <strong>Persistent Cookies:</strong> Long-term cookies that
                    remain on your device
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how
                    users interact with CognixGpt
                  </li>
                  <li>
                    <strong>Authentication Cookies:</strong> Ensure you stay
                    securely logged in
                  </li>
                </ul>
              </section>

              <section>
                <h3>Your Privacy Rights</h3>
                <p>You have the right to control cookie usage. You can:</p>
                <ul>
                  <li>Accept or reject non-essential cookies</li>
                  <li>Clear cookies from your browser settings</li>
                  <li>Request deletion of your personal data</li>
                  <li>Opt-out of analytics tracking</li>
                </ul>
              </section>

              <section>
                <h3>Important Information</h3>
                <p>
                  While CognixGpt strives to provide accurate and helpful
                  information, we recommend:
                </p>
                <ul>
                  <li>Verifying critical information from official sources</li>
                  <li>
                    Not relying solely on AI-generated content for important
                    decisions
                  </li>
                  <li>Reviewing responses for factual accuracy</li>
                  <li>Consulting professionals for specialized advice</li>
                </ul>
              </section>

              <section>
                <h3>Data Protection</h3>
                <p>
                  Your data is important to us. We employ industry-standard
                  security measures to protect your information and comply with
                  data protection regulations including GDPR and CCPA.
                </p>
              </section>
            </div>

            <div className="modalFooter">
              <button className="acceptBtn" onClick={() => setShowModal(false)}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
