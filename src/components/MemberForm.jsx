import React, { useState } from "react";
import { useAppDispatch, useAppState } from "../context/AppContext.jsx";
import { RELATIONS } from "../utils/constants.js";

export default function MemberForm() {
  const { members } = useAppState();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [relation, setRelation] = useState(RELATIONS[0].id);
  const [phone, setPhone] = useState("");
  const [upi, setUpi] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError("Enter a name first.");
    if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      return setError("Someone with that name is already added.");
    }
    dispatch({
      type: "ADD_MEMBER",
      name: trimmed,
      relation,
      phone: phone.trim(),
      upi: upi.trim(),
      email: email.trim(),
    });
    setName("");
    setPhone("");
    setUpi("");
    setEmail("");
    setError("");
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="two-col">
        <div className="field">
          <label htmlFor="member-name">Name</label>
          <input id="member-name" value={name} placeholder="e.g. Priya"
            onChange={(e) => { setName(e.target.value); setError(""); }} />
        </div>
        <div className="field">
          <label htmlFor="member-relation">Relation</label>
          <select id="member-relation" value={relation} onChange={(e) => setRelation(e.target.value)}>
            {RELATIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
      </div>
      <div className="two-col">
        <div className="field">
          <label htmlFor="member-phone">WhatsApp number <em>(optional, for reminders)</em></label>
          <input id="member-phone" value={phone} placeholder="919876543210" inputMode="tel"
            onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="member-upi">UPI ID <em>(optional, for quick pay)</em></label>
          <input id="member-upi" value={upi} placeholder="priya@okhdfcbank"
            onChange={(e) => setUpi(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="member-email">Email <em>(optional, so ticket amounts can be emailed to them)</em></label>
        <input id="member-email" type="email" value={email} placeholder="priya@example.com"
          onChange={(e) => setEmail(e.target.value)} />
      </div>
      {error && <span className="field-error">{error}</span>}
      <button type="submit" className="primary-btn" style={{ justifySelf: "start" }}>Add person</button>
    </form>
  );
}
