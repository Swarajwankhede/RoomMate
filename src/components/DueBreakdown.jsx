import React from "react";
import { useAppDispatch } from "../context/AppContext.jsx";
import { pairEntries } from "../utils/balances.js";
import { formatINR } from "../utils/constants.js";

// Shows exactly how the running balance with one person was reached,
// e.g. coffee (+₹25) then biscuits (−₹15) = ₹10. Any entry can be removed
// if it was logged by mistake.
export default function DueBreakdown({ expenses, me, other }) {
  const dispatch = useAppDispatch();
  const entries = pairEntries(expenses, me.id, other.id).sort(
    (a, b) => b.expense.createdAt - a.expense.createdAt
  );

  function remove(e) {
    if (window.confirm(`Remove "${e.description}" (${formatINR(e.amount)}) from the ledger?`)) {
      dispatch({ type: "DELETE_EXPENSE", id: e.id });
    }
  }

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <strong>Nothing between you two yet</strong>
        Expenses you share with {other.name} will show up here.
      </div>
    );
  }

  return (
    <ul className="ledger-list">
      {entries.map(({ expense: e, delta }) => (
        <li className="ledger-row" key={e.id}>
          <span className="date">
            {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
          <span className="desc">
            <strong>{e.description}</strong>
            <span>
              {e.paidBy === me.id ? "You paid" : `${other.name} paid`} · {formatINR(e.amount)}
              {e.isSettlement ? " (settlement)" : ""}
            </span>
          </span>
          <span className="paid-by">{delta > 0 ? `${other.name} owes you` : `You owe ${other.name}`}</span>
          <span className={`amount ${delta > 0 ? "credit" : "debit"}`}>
            {delta > 0 ? "+" : "−"}{formatINR(Math.abs(delta))}
            <div><button className="delete-btn" onClick={() => remove(e)}>Remove</button></div>
          </span>
        </li>
      ))}
    </ul>
  );
}
