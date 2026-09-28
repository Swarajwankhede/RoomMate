import React, { useState } from "react";
import { useAppDispatch } from "../context/AppContext.jsx";
import { formatINR } from "../utils/constants.js";
import { roundRupees, toPaise, toRupees } from "../utils/money.js";
import { generateTicketId } from "../utils/ticket.js";

// balance > 0 : `other` owes `me` -> record "they paid me"
// balance < 0 : `me` owes `other` -> record "I paid them"
// Amounts are exact to the paisa and can never exceed what is owed, so
// paying the full due always lands on exactly ₹0 — no leftover, no flip.
export default function SettleForm({ me, other, balance }) {
  const dispatch = useAppDispatch();
  const owedPaise = Math.abs(toPaise(balance));
  const owed = toRupees(owedPaise);
  const [amount, setAmount] = useState(String(owed));
  const [method, setMethod] = useState("upi");
  const [error, setError] = useState("");

  if (owedPaise < 1) return null;
  const theyPayMe = balance > 0;

  function submit(e) {
    e.preventDefault();
    const paise = toPaise(amount);
    if (!paise || paise <= 0) return setError("Enter an amount greater than ₹0.");
    if (paise > owedPaise) return setError(`That's more than the ${formatINR(owed)} due.`);

    dispatch({
      type: "RECORD_SETTLEMENT",
      expense: {
        id: crypto.randomUUID(),
        groupId: null,
        ticketId: generateTicketId(),
        description: `Settlement via ${method === "upi" ? "UPI" : "cash"}`,
        amount: roundRupees(amount),
        category: "settlement",
        paidBy: theyPayMe ? other.id : me.id,
        splitBetween: [theyPayMe ? me.id : other.id],
        date: new Date().toISOString().slice(0, 10),
        createdAt: Date.now(),
        isSettlement: true,
        cashSettled: false,
      },
    });
    setError("");
  }

  return (
    <form className="settle-form" onSubmit={submit}>
      <div className="settle-form-title">
        {theyPayMe ? `${other.name} paid you` : `You paid ${other.name}`}
      </div>
      <div className="settle-form-row">
        <div className="field">
          <label htmlFor={`amt-${other.id}`}>Amount (₹)</label>
          <input id={`amt-${other.id}`} type="number" min="0.01" max={owed} step="0.01" value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(""); }} />
        </div>
        <div className="field">
          <label htmlFor={`method-${other.id}`}>Method</label>
          <select id={`method-${other.id}`} value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
          </select>
        </div>
        <button className="primary-btn" type="submit">Record</button>
      </div>
      {error && <span className="field-error">{error}</span>}
      <div className="settle-hint">Due: {formatINR(owed)}. Partial payments are fine — the rest stays as a due.</div>
    </form>
  );
}
