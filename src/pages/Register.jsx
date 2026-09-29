import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError("");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Tell us your name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Enter a valid email address.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords don't match.");

    setBusy(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
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
        <p>Create an account in a few seconds. Your ledger is stored on this device, separately for each account.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create your account</h2>
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input id="name" value={form.name} onChange={set("name")} autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" />
        </div>
        <div className="field">
          <label htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
        </div>
        {error && <span className="field-error">{error}</span>}
        <button className="primary-btn" type="submit" disabled={busy}>{busy ? "Creating…" : "Sign up"}</button>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
