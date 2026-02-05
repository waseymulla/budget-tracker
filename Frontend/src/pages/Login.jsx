// Login page (reuses auth.css)

import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { useEffect, useState } from "react";
import { loginUser, getAuthToken } from "../services/authService.js";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //if already logged in, go straight to dashboard
  useEffect(() => {
    const token = getAuthToken();
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const u = username.trim();
    const p = password;

    if (!u || !p) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginUser(u, p);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed");
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-description">Let’s get you back to your budget.</p>
        <p className="auth-subdescription">
          Track income, expenses, and balance in one place. Filter by month,
          type, or category, and stay in control.
        </p>
      </div>

      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="auth-form-title">Login to your account</p>
          <p className="auth-form-subtitle">
            Enter your username and password to access your budget workspace
          </p>

          {error && <p className="auth-error">{error}</p>}

          <p className="auth-label">Username</p>
          <input
            type="text"
            placeholder="Username"
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            disabled={loading}
          />

          <p className="auth-label">Password</p>
          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer-text">
          New here?{" "}
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
