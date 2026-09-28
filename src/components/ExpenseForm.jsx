import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppState } from "../context/AppContext.jsx";
import { EXPENSE_CATEGORIES } from "../utils/constants.js";
import { describeBalance, dueImpact } from "../utils/balances.js";
import { roundRupees } from "../utils/money.js";
import { generateTicketId } from "../utils/ticket.js";

const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseForm() {
  const { members, groups, expenses } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams(); // /add-expense?group=<id> pre-selects a group
  const self = members.find((m) => m.isSelf);

  const poolFor = (gid) => {
    const g = groups.find((x) => x.id === gid);
    return g ? members.filter((m) => g.memberIds.includes(m.id)) : members;
  };

  const initialGroup = groups.some((g) => g.id === params.get("group")) ? params.get("group") : "";

  const [groupId, setGroupId] = useState(initialGroup);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [paidBy, setPaidBy] = useState(self.id);
  const [splitBetween, setSplitBetween] = useState(() => poolFor(initialGroup).map((m) => m.id));
  const [mode, setMode] = useState("adjust"); // "adjust" = deduct from dues, "cash" = paid back now
  const [date, setDate] = useState(today());
  const [errors, setErrors] = useState({});

  const pool = poolFor(groupId);
  const nameOf = (id) => (id === self.id ? "You" : members.find((m) => m.id === id)?.name || "Someone");

  function handleGroupChange(gid) {
    setGroupId(gid);
    const next = poolFor(gid);
    setSplitBetween(next.map((m) => m.id));
    if (!next.some((m) => m.id === paidBy)) setPaidBy(next[0]?.id || "");
  }

  const toggleSplit = (id) =>
    setSplitBetween((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  // Live preview: what this expense does to the dues between the payer and everyone else.
  const impact = useMemo(() => {
    const amt = Number(amount);
    if (mode !== "adjust" || !amt || amt <= 0 || !paidBy) return [];
    return dueImpact(expenses, paidBy, splitBetween, amt);
  }, [expenses, mode, amount, paidBy, splitBetween]);

  function validate() {
    const next = {};
    if (!description.trim()) next.description = "Give this expense a short name.";
    const n = Number(amount);
    if (!amount || Number.isNaN(n) || n < 0.01) next.amount = "Enter an amount of at least ₹0.01.";
    if (!paidBy) next.paidBy = "Choose who paid.";
    if (splitBetween.filter((id) => id !== paidBy).length === 0) {
      next.split = "Pick at least one other person to share this with.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const id = crypto.randomUUID();
    dispatch({
      type: "ADD_EXPENSE",
      expense: {
        id,
        groupId: groupId || null,
        ticketId: generateTicketId(),
        description: description.trim(),
        amount: roundRupees(amount),
        category,
        paidBy,
        splitBetween,
        date,
        createdAt: Date.now(),
        isSettlement: false,
        cashSettled: mode === "cash",
      },
    });
    navigate(`/ticket/${id}`);
  }

  if (members.length < 2) {
    return (
      <div className="empty-state">
        <strong>Add someone to split with</strong>
        You need at least one other person first. <Link to="/people">Add a person →</Link>
      </div>
    );
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="group">Group <em>(optional)</em></label>
        <select id="group" value={groupId} onChange={(e) => handleGroupChange(e.target.value)}>
          <option value="">No group — split directly with people</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="two-col">
        <div className="field">
          <label htmlFor="description">What was it for?</label>
          <input id="description" value={description} placeholder="e.g. Coffee, Zomato dinner, electricity bill"
            onChange={(e) => setDescription(e.target.value)} />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>
        <div className="field">
          <label htmlFor="amount">Amount (₹)</label>
          <input id="amount" type="number" min="0" step="0.01" value={amount} placeholder="0.00"
            onChange={(e) => setAmount(e.target.value)} />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>
      </div>

      <div className="two-col">
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="paidBy">Who paid?</label>
        <select id="paidBy" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          {pool.map((m) => <option key={m.id} value={m.id}>{m.isSelf ? `${m.name} (you)` : m.name}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Split equally between</label>
        <div className="checkbox-grid">
          {pool.map((m) => {
            const checked = splitBetween.includes(m.id);
            return (
              <label key={m.id} className={`checkbox-pill ${checked ? "checked" : ""}`}>
                <input type="checkbox" checked={checked} onChange={() => toggleSplit(m.id)} />
                {m.isSelf ? "You" : m.name}
              </label>
            );
          })}
        </div>
        {errors.split && <span className="field-error">{errors.split}</span>}
      </div>

      <div className="field">
        <label>How should the share be settled?</label>
        <div className="mode-grid">
          <label className={`mode-card ${mode === "adjust" ? "active" : ""}`}>
            <input type="radio" name="mode" checked={mode === "adjust"} onChange={() => setMode("adjust")} />
            <strong>Deduct from dues</strong>
            <span>Adds to the running balance, so anything owed earlier cancels out automatically.</span>
          </label>
          <label className={`mode-card ${mode === "cash" ? "active" : ""}`}>
            <input type="radio" name="mode" checked={mode === "cash"} onChange={() => setMode("cash")} />
            <strong>Paid back right now</strong>
            <span>Everyone hands over their share on the spot. No dues are created.</span>
          </label>
        </div>
      </div>

      {mode === "adjust" && impact.length > 0 && (
        <div className="impact-box">
          <div className="impact-title">What this does to your dues</div>
          {impact.map((row) => {
            const other = nameOf(row.id);
            const payer = nameOf(paidBy);
            return (
              <div className="impact-row" key={row.id}>
                <span className="impact-before">{describeBalance(row.before, other, payer)}</span>
                <span className="impact-arrow">→</span>
                <strong>{describeBalance(row.after, other, payer)}</strong>
              </div>
            );
          })}
        </div>
      )}

      <button type="submit" className="primary-btn" style={{ justifySelf: "start" }}>
        Add expense &amp; generate ticket
      </button>
    </form>
  );
}
