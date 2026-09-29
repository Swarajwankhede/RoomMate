import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useAuth } from "../context/AuthContext.jsx";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function validate(values) {
  const errors = {};
  if (!values.email.trim()) errors.email = "Enter your email.";
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!values.password) errors.password = "Enter your password.";
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validate,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus("");
      try {
        await login(values);
        navigate("/", { replace: true });
      } catch (err) {
        setStatus(err.message);
        setSubmitting(false);
      }
    },
  });

  // Shows a field's error only after the person has touched that field.
  const err = (name) => formik.touched[name] && formik.errors[name];
  const invalid = (name) => (err(name) ? { borderColor: "#e5484d" } : undefined);

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
      <form className="auth-card" onSubmit={formik.handleSubmit} noValidate>
        <h2>Welcome back</h2>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" style={invalid("email")}
            value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {err("email") && <span className="field-error">{formik.errors.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" style={invalid("password")}
            value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {err("password") && <span className="field-error">{formik.errors.password}</span>}
        </div>
        {formik.status && <span className="field-error">{formik.status}</span>}
        <button className="primary-btn" type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Logging in…" : "Log in"}
        </button>
        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
/*import React, { useState } from "react";
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
*/