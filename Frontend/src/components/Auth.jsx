import { useState, useContext } from "react";
import { CognixContext } from "../Context/Cognix";
import "./Auth.css";
import { Mail, Lock, User, Eye, EyeOff, Loader } from "lucide-react";

const Auth = () => {
  const { setToken } = useContext(CognixContext);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  // Name validation
  const isValidName = (name) => {
    return name.trim().length >= 2;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validation
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill all fields");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isValidPassword(password)) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!isLogin && !isValidName(name)) {
      setError("Name must be at least 2 characters long");
      return;
    }

    setLoading(true);

    const url = isLogin
      ? "http://localhost:8000/api/auth/login"
      : "http://localhost:8000/api/auth/signup";

    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      console.log("Auth Response:", data, "Status:", res.status);

      // ✅ Check if response has token
      if (data?.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);

        if (isLogin) {
          setSuccessMessage("✅ Login successful! Redirecting...");
        } else {
          setSuccessMessage("✅ Account created! Redirecting to CognixGpt...");
        }

        // Clear form
        setEmail("");
        setPassword("");
        setName("");

        // Token is set, context will handle redirect automatically
        return;
      }

      // ❌ If signup was successful but no token, try logging in automatically
      if (!isLogin && res.ok && !data.token) {
        console.log("Signup successful, attempting auto-login...");

        // Auto-login with the credentials
        try {
          const loginRes = await fetch("http://localhost:8000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const loginData = await loginRes.json();

          if (loginData?.token) {
            localStorage.setItem("token", loginData.token);
            setToken(loginData.token);
            setSuccessMessage(
              "✅ Account created and logged in! Redirecting...",
            );
            setEmail("");
            setPassword("");
            setName("");
            return;
          } else {
            setSuccessMessage(
              "✅ Account created! Please login with your credentials.",
            );
            setTimeout(() => {
              setIsLogin(true);
              setPassword("");
            }, 2000);
            return;
          }
        } catch (loginErr) {
          console.error("Auto-login failed:", loginErr);
          setSuccessMessage("✅ Account created! Please login to continue.");
          setTimeout(() => {
            setIsLogin(true);
            setPassword("");
          }, 2000);
          return;
        }
      }

      // ❌ Handle error responses
      if (data?.error) {
        setError(data.error);
      } else if (data?.message?.includes("already")) {
        setError("Email already registered. Please login instead.");
      } else if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
      } else {
        setError("Unable to process request. Please try again.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Server error. Please check your connection and try again.");
    }

    setLoading(false);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccessMessage("");
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="auth-container">
      {/* Animated background elements */}
      <div className="auth-bg-blur blur-1"></div>
      <div className="auth-bg-blur blur-2"></div>
      <div className="auth-bg-blur blur-3"></div>

      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="20" cy="20" r="18" stroke="#3b82f6" strokeWidth="2" />
              <path
                d="M20 8v24M8 20h24"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1>{isLogin ? "Welcome Back" : "Join CognixGpt"}</h1>
          <p>
            {isLogin
              ? "Login to continue"
              : "Create your account to get started"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name Input (Sign Up Only) */}
          {!isLogin && (
            <div className="form-group">
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className={
                    name.length > 0 && !isValidName(name) ? "input-error" : ""
                  }
                />
              </div>
              {name.length > 0 && !isValidName(name) && (
                <span className="input-hint">
                  Name must be at least 2 characters
                </span>
              )}
            </div>
          )}

          {/* Email Input */}
          <div className="form-group">
            <div className="input-wrapper">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={
                  email.length > 0 && !isValidEmail(email) ? "input-error" : ""
                }
              />
            </div>
            {email.length > 0 && !isValidEmail(email) && (
              <span className="input-hint">Please enter a valid email</span>
            )}
          </div>

          {/* Password Input */}
          <div className="form-group">
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={
                  password.length > 0 && !isValidPassword(password)
                    ? "input-error"
                    : ""
                }
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password.length > 0 && !isValidPassword(password) && (
              <span className="input-hint">
                Password must be at least 6 characters
              </span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success">
              <span>✓</span>
              <p>{successMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading || !email || !password || (!isLogin && !name)}
          >
            {loading ? (
              <>
                <Loader size={20} className="spinner" />
                <span>{isLogin ? "Logging in..." : "Creating account..."}</span>
              </>
            ) : (
              <span>{isLogin ? "Login" : "Sign Up"}</span>
            )}
          </button>
        </form>

        {/* Toggle Auth Mode */}
        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="auth-toggle"
              disabled={loading}
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>

        {/* Info Text */}
        <div className="auth-info">
          <p>🔒 Your data is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
