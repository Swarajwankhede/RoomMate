import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LINKS = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
  { to: "/people", label: "People", icon: "👥" },
  { to: "/groups", label: "Groups", icon: "🗂️" },
  { to: "/settle", label: "Settle up", icon: "🤝" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [showEmail, setShowEmail] = useState(false);

  return (
    <aside className="sidebar">
      <Link to="/" className="brand">
        RoomMate <span className="rupee-badge">₹</span>
      </Link>

      <Link to="/add-expense" className="primary-btn sidebar-cta">+ Add expense</Link>

      <nav>
        <ul className="side-nav">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
                <span className="side-icon">{l.icon}</span>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-user">
        <button
          type="button"
          className="user-chip user-chip-btn"
          aria-expanded={showEmail}
          onClick={() => setShowEmail((v) => !v)}
        >
          <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
          <span className="user-name">{user.name}</span>
        </button>
        {showEmail && (
          <div className="user-email" role="status">
            Signed in as<br /><strong>{user.email}</strong>
          </div>
        )}
        <button className="secondary-btn" onClick={logout}>Log out</button>
      </div>
    </aside>
  );
}
// import React from "react";
// import { Link, NavLink } from "react-router-dom";
// import { useAuth } from "../context/AuthContext.jsx";

// const LINKS = [
//   { to: "/", label: "Dashboard", icon: "📊", end: true },
//   { to: "/people", label: "People", icon: "👥" },
//   { to: "/groups", label: "Groups", icon: "🗂️" },
//   { to: "/settle", label: "Settle up", icon: "🤝" },
// ];

// export default function Sidebar() {
//   const { user, logout } = useAuth();

//   return (
//     <aside className="sidebar">
//       <Link to="/" className="brand">
//         RoomMate <span className="rupee-badge">₹</span>
//       </Link>

//       <Link to="/add-expense" className="primary-btn sidebar-cta">+ Add expense</Link>

//       <nav>
//         <ul className="side-nav">
//           {LINKS.map((l) => (
//             <li key={l.to}>
//               <NavLink to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
//                 <span className="side-icon">{l.icon}</span>
//                 {l.label}
//               </NavLink>
//             </li>
//           ))}
//         </ul>
//       </nav>

//       <div className="sidebar-user">
//         <div className="user-chip" title={user.email}>
//           <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
//           <span className="user-name">{user.name}</span>
//         </div>
//         <button className="secondary-btn" onClick={logout}>Log out</button>
//       </div>
//     </aside>
//   );
// }
