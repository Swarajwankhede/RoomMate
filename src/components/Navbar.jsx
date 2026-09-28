import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/people", label: "People" },
  { to: "/groups", label: "Groups" },
  { to: "/settle", label: "Settle up" },
];

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-row">
        <Link to="/" className="brand">
          RoomMate <span className="rupee-badge">₹</span>
        </Link>
        <div className="topbar-user">
          <Link to="/add-expense" className="primary-btn">+ Add expense</Link>
          <span className="user-chip" title={user.email}>
            <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
            {user.name}
          </span>
          <button className="secondary-btn" onClick={logout}>Log out</button>
        </div>
      </div>
      <ul className="nav-pills">
        {LINKS.map((l) => (
          <li key={l.to}>
            <NavLink to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </header>
  );
}
