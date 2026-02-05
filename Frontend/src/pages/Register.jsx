//creating a the register page:

// a div that contains a h1 with the text "Dashboard Page" will be on the left side of the page by default and as the page horizontally shrinks the h1 will move to top center of the page above teh div for registering a user
//registering will be like a form with input fields for name, email, and password and a submit button and a line and under that will be text that "Already have an account? Login" where login is a link to the login page.

// i need to track and store user input for username and password using useState hooks
//create loading and error state to provide feedback during registration process

import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { useState } from "react";
import { registerUser } from "../services/authService.js";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    //validation avoids unnecessary API calls
    const u = username.trim();
    const p = password;

    if (!u || !p) {
      setError("Username and password are required");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Call the registration service
      await registerUser(u, p);
      // Handle successful registration use useNavigate to navigate to login page
      navigate("/login");
    } catch (err) {
      setError(err?.message || "Registration failed");
      //stopt the function execution if error occurs
      return;
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-description">Let’s get you back to your budget.</p>
        <p className="auth-subdescription">
          Track income, expenses, and balance in one place. Filter by month,
          type, or category, and stay in control.
        </p>
      </div>

      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="auth-form-title">Create account</p>
          <p className="auth-form-subtitle">
            Select your username and password to create your budget workspace
          </p>
          {error && <p className="auth-error">{error}</p>}
          <p className="auth-label">Username</p>
          <input
            type="text"
            placeholder="Username"
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <p className="auth-label">Password</p>
          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="auth-button" disabled={loading}>
            Register
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
