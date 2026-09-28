import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <h1>RoomMate <span className="rupee-badge">₹</span></h1>
        <p>Split chai, rent, trips and everything in between. Dues cancel out automatically — no more "who owes whom" arguments.</p>
        <ul>
          <li>☕ Coffee today, biscuits tomorrow? We net it for you.</li>
          <li>💬 Remind friends on WhatsApp in one tap.</li>
          <li>📲 Pay back over any UPI app.</li>
        </ul>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }} />
        </div>
        {error && <span className="field-error">{error}</span>}
        <button className="primary-btn" type="submit" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
