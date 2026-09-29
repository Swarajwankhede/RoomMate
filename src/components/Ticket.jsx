import React from "react";
import { formatINR, categoryMeta } from "../utils/constants.js";
import { expenseSharesPaise } from "../utils/balances.js";

export default function Ticket({ expense, group, members }) {
  const nameOf = (id) => members.find((m) => m.id === id)?.name || "Someone";
  const cat = categoryMeta(expense.category);
  const shareCount = expense.splitBetween.length || 1;
  const shares = expenseSharesPaise(expense);

  return (
    <div className="ticket">
      <div className="ticket-head">
        <span>RoomMate</span>
        <span>{expense.isSettlement ? "SETTLEMENT" : expense.type === "loan" ? "LOAN TICKET" : "EXPENSE TICKET"}</span>
      </div>
      <div className="ticket-id">{expense.ticketId}</div>

      <div className="ticket-row"><span>Group</span><span>{group?.name || "No group (direct)"}</span></div>
      <div className="ticket-row"><span>Date</span><span>{new Date(expense.date).toLocaleDateString("en-IN")}</span></div>
      {!expense.isSettlement && (
        <div className="ticket-row">
          <span>Category</span><span>{cat.icon} {cat.label}</span>
        </div>
      )}
      {!expense.isSettlement && (
        <div className="ticket-row">
          <span>{expense.type === "loan" ? "Type" : "Settled by"}</span>
          <span>{expense.type === "loan" ? "Lent money (not split)" : expense.cashSettled ? "Paid back on the spot" : "Deducted from dues"}</span>
        </div>
      )}
      <div className="ticket-divider" />

      <div className="ticket-desc">{expense.description}</div>
      <div className="ticket-amount">{formatINR(expense.amount)}</div>

      <div className="ticket-divider" />
      <div className="ticket-row"><span>{expense.type === "loan" ? "Lent by" : "Paid by"}</span><span>{nameOf(expense.paidBy)}</span></div>
      <div className="ticket-split-title">
        {expense.isSettlement ? "Paid to" : expense.type === "loan" ? "Lent to" : `Split (${shareCount} ${shareCount === 1 ? "person" : "people"})`}
      </div>
      <ul className="ticket-split-list">
        {expense.splitBetween.map((id) => (
          <li key={id}>
            <span>{nameOf(id)}</span>
            <span>{formatINR((shares[id] ?? 0) / 100)}</span>
          </li>
        ))}
      </ul>

      <div className="ticket-divider" />
      <div className="ticket-footer">Issued {new Date(expense.createdAt).toLocaleString("en-IN")}</div>
    </div>
  );
}