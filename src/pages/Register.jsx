import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useAuth } from "../context/AuthContext.jsx";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Tell us your name.";
  if (!values.email.trim()) errors.email = "Enter your email.";
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!values.password) errors.password = "Choose a password.";
  else if (values.password.length < 6) errors.password = "Password must be at least 6 characters.";
  if (!values.confirm) errors.confirm = "Confirm your password.";
  else if (values.password !== values.confirm) errors.confirm = "Passwords don't match.";
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", confirm: "" },
    validate,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus("");
      try {
        await register({ name: values.name, email: values.email, password: values.password });
        navigate("/", { replace: true });
      } catch (err) {
        setStatus(err.message);
        setSubmitting(false);
      }
    },
  });

  const err = (name) => formik.touched[name] && formik.errors[name];
  const invalid = (name) => (err(name) ? { borderColor: "#e5484d" } : undefined);
  const input = (name, label, type = "text", autoComplete) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} autoComplete={autoComplete} style={invalid(name)}
        value={formik.values[name]} onChange={formik.handleChange} onBlur={formik.handleBlur} />
      {err(name) && <span className="field-error">{formik.errors[name]}</span>}
    </div>
  );

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <h1>RoomMate <span className="rupee-badge">₹</span></h1>
        <p>Create an account in a few seconds. Your ledger is stored on this device, separately for each account.</p>
      </div>
      <form className="auth-card" onSubmit={formik.handleSubmit} noValidate>
        <h2>Create your account</h2>
        {input("name", "Your name", "text", "name")}
        {input("email", "Email", "email", "email")}
        {input("password", "Password", "password", "new-password")}
        {input("confirm", "Confirm password", "password", "new-password")}
        {formik.status && <span className="field-error">{formik.status}</span>}
        <button className="primary-btn" type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Creating…" : "Sign up"}
        </button>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext.jsx";

// export default function Register() {
//   const { register } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
//   const [error, setError] = useState("");
//   const [busy, setBusy] = useState(false);

//   const set = (key) => (e) => {
//     setForm((f) => ({ ...f, [key]: e.target.value }));
//     setError("");
//   };

//   async function handleSubmit(e) {
//     e.preventDefault();
//     if (!form.name.trim()) return setError("Tell us your name.");
//     if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Enter a valid email address.");
//     if (form.password.length < 6) return setError("Password must be at least 6 characters.");
//     if (form.password !== form.confirm) return setError("Passwords don't match.");

//     setBusy(true);
//     try {
//       await register({ name: form.name, email: form.email, password: form.password });
//       navigate("/", { replace: true });
//     } catch (err) {
//       setError(err.message);
//       setBusy(false);
//     }
//   }

//   return (
//     <div className="auth-shell">
//       <div className="auth-hero">
//         <h1>RoomMate <span className="rupee-badge">₹</span></h1>
//         <p>Create an account in a few seconds. Your ledger is stored on this device, separately for each account.</p>
//       </div>
//       <form className="auth-card" onSubmit={handleSubmit}>
//         <h2>Create your account</h2>
//         <div className="field">
//           <label htmlFor="name">Your name</label>
//           <input id="name" value={form.name} onChange={set("name")} autoComplete="name" />
//         </div>
//         <div className="field">
//           <label htmlFor="email">Email</label>
//           <input id="email" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
//         </div>
//         <div className="field">
//           <label htmlFor="password">Password</label>
//           <input id="password" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" />
//         </div>
//         <div className="field">
//           <label htmlFor="confirm">Confirm password</label>
//           <input id="confirm" type="password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
//         </div>
//         {error && <span className="field-error">{error}</span>}
//         <button className="primary-btn" type="submit" disabled={busy}>{busy ? "Creating…" : "Sign up"}</button>
//         <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
//       </form>
//     </div>
//   );
// }
