import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppState } from "../context/AppContext.jsx";
import { EXPENSE_CATEGORIES } from "../utils/constants.js";
import { describeBalance, dueImpact } from "../utils/balances.js";
import { roundRupees } from "../utils/money.js";
import { generateTicketId } from "../utils/ticket.js";
import PeoplePicker from "./PeoplePicker.jsx";

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
  const [splitBetween, setSplitBetween] = useState([]); // nobody is pre-selected, not even the payer
  const [kind, setKind] = useState("split"); // "split" = shared bill, "loan" = lent money (not split)
  const [mode, setMode] = useState("adjust"); // "adjust" = deduct from dues, "cash" = paid back now
  const [date, setDate] = useState(today());
  const [errors, setErrors] = useState({});

  const isLoan = kind === "loan";
  const fullPool = poolFor(groupId);
  // For a loan the lender is never one of the borrowers.
  const pool = isLoan ? fullPool.filter((m) => m.id !== paidBy) : fullPool;
  const nameOf = (id) => (id === self.id ? "You" : members.find((m) => m.id === id)?.name || "Someone");

  function handleGroupChange(gid) {
    setGroupId(gid);
    const next = poolFor(gid);
    // Keep only the people who are still available; don't auto-add anyone.
    setSplitBetween((cur) => cur.filter((id) => next.some((m) => m.id === id)));
    if (!next.some((m) => m.id === paidBy)) setPaidBy(next[0]?.id || "");
  }

  function handlePayerChange(id) {
    setPaidBy(id);
    if (isLoan) setSplitBetween((cur) => cur.filter((x) => x !== id));
  }

  function handleKindChange(next) {
    setKind(next);
    if (next === "loan") {
      setSplitBetween((cur) => cur.filter((x) => x !== paidBy));
      setMode("adjust");
    }
  }

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
      next.split = isLoan ? "Pick who you lent the money to." : "Pick at least one other person to share this with.";
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
        category: isLoan ? "other" : category,
        paidBy,
        splitBetween: isLoan ? splitBetween.filter((id) => id !== paidBy) : splitBetween,
        type: isLoan ? "loan" : "split",
        date,
        createdAt: Date.now(),
        isSettlement: false,
        cashSettled: !isLoan && mode === "cash",
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
        <label>What kind of entry is this?</label>
        <div className="mode-grid">
          <label className={`mode-card ${!isLoan ? "active" : ""}`}>
            <input type="radio" name="kind" checked={!isLoan} onChange={() => handleKindChange("split")} />
            <strong>Split a bill</strong>
            <span>A shared expense divided equally between the people you pick.</span>
          </label>
          <label className={`mode-card ${isLoan ? "active" : ""}`}>
            <input type="radio" name="kind" checked={isLoan} onChange={() => handleKindChange("loan")} />
            <strong>No Split</strong>
            <span>You paid for someone else. They owe the full amount back, nothing is split with the payer.</span>
          </label>
        </div>
      </div>

      <div className="field">
        <label htmlFor="group">Group <em>(optional)</em></label>
        <select id="group" value={groupId} onChange={(e) => handleGroupChange(e.target.value)}>
          <option value="">No group — split directly with people</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="two-col">
        <div className="field">
          <label htmlFor="description">{isLoan ? "What was the loan for?" : "What was it for?"}</label>
          <input id="description" value={description} placeholder={isLoan ? "e.g. Cash lent, phone recharge" : "e.g. Coffee, Zomato dinner, electricity bill"}
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
        {!isLoan && (
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
        )}
        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="paidBy">{isLoan ? "Who lent the money?" : "Who paid?"}</label>
        <select id="paidBy" value={paidBy} onChange={(e) => handlePayerChange(e.target.value)}>
          {fullPool.map((m) => <option key={m.id} value={m.id}>{m.isSelf ? `${m.name} (you)` : m.name}</option>)}
        </select>
      </div>

      <div className="field">
        <label>{isLoan ? "Lent to" : "Split equally between"}</label>
        <PeoplePicker
          options={pool}
          selectedIds={splitBetween}
          onChange={setSplitBetween}
          placeholder={isLoan ? "Search who you lent to…" : "Search people to add to the split…"}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <button type="button" className="chip-btn" onClick={() => setSplitBetween(pool.map((m) => m.id))}>Select everyone</button>
          <button type="button" className="chip-btn" onClick={() => setSplitBetween([])}>Clear</button>
        </div>
        {!isLoan && splitBetween.length > 0 && !splitBetween.includes(paidBy) && (
          <span className="muted">{nameOf(paidBy)} isn't in the split, so the others owe the full amount.</span>
        )}
        {isLoan && splitBetween.length > 1 && Number(amount) > 0 && (
          <span className="muted">The amount is divided equally between the borrowers.</span>
        )}
        {errors.split && <span className="field-error">{errors.split}</span>}
      </div>

      {!isLoan && (
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
      )}

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
        {isLoan ? "Record loan & generate ticket" : "Add expense & generate ticket"}
      </button>
    </form>
  );
}