// src/components/TopBar.jsx
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService.js";

export default function TopBar({ title = "Dashboard", showLogout = true }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <header className="dash-topbar">
      <div className="dash-topbar__wrap">
        <h1 className="dash-topbar__title">{title}</h1>
        <div className="dash-topbar__right">
          {showLogout && (
            <button
              type="button"
              className="dash-btn dash-btn--ghost"
              onClick={handleLogout}
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
