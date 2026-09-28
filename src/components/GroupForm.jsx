import React, { useState } from "react";
import { useAppDispatch, useAppState } from "../context/AppContext.jsx";
import { GROUP_CATEGORIES } from "../utils/constants.js";

export default function GroupForm() {
  const { members } = useAppState();
  const dispatch = useAppDispatch();
  const self = members.find((m) => m.isSelf);
  const others = members.filter((m) => !m.isSelf);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(GROUP_CATEGORIES[0].id);
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState("");

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError("Give the group a name.");
    if (picked.length < 1) return setError("Pick at least one other person.");
    dispatch({ type: "ADD_GROUP", name: name.trim(), category, memberIds: [self.id, ...picked] });
    setName("");
    setPicked([]);
    setError("");
  }

  if (others.length < 1) {
    return (
      <div className="empty-state">
        <strong>Add a person first</strong>
        Head to the <b>People</b> tab and add a friend, family member, or flatmate. You're included in every group automatically.
      </div>
    );
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="two-col">
        <div className="field">
          <label htmlFor="group-name">Group name</label>
          <input id="group-name" value={name} placeholder="e.g. Flat 4B, Goa Trip, Office Lunch"
            onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="group-category">Category</label>
          <select id="group-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {GROUP_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Who's in it? (you're added automatically)</label>
        <div className="checkbox-grid">
          {others.map((m) => {
            const checked = picked.includes(m.id);
            return (
              <label key={m.id} className={`checkbox-pill ${checked ? "checked" : ""}`}>
                <input type="checkbox" checked={checked} onChange={() => toggle(m.id)} />
                {m.name}
              </label>
            );
          })}
        </div>
      </div>
      {error && <span className="field-error">{error}</span>}
      <button type="submit" className="primary-btn" style={{ justifySelf: "start" }}>Create group</button>
    </form>
  );
}
