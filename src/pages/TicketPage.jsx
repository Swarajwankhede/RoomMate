import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppState } from "../context/AppContext.jsx";
import { expenseSharesPaise } from "../utils/balances.js";
import { formatINR } from "../utils/constants.js";
import { mailtoLink } from "../utils/share.js";
import { ticketEmailBody } from "../utils/ticket.js";
import Ticket from "../components/Ticket.jsx";

export default function TicketPage() {
  const { expenseId } = useParams();
  const { members, groups, expenses } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const expense = expenses.find((e) => e.id === expenseId);
  if (!expense) {
    return (
      <div className="empty-state">
        <strong>Ticket not found</strong>
        <Link to="/">Back to dashboard</Link>
      </div>
    );
  }

  const group = groups.find((g) => g.id === expense.groupId);
  const nameOf = (id) => members.find((m) => m.id === id)?.name || "Someone";
  const payerName = nameOf(expense.paidBy);

  // Everyone who owes a share on this expense (excludes the payer, and any
  // settlement, which isn't a bill to be emailed).
  const shares = expenseSharesPaise(expense);
  const owers = expense.isSettlement
    ? []
    : expense.splitBetween
        .filter((id) => id !== expense.paidBy)
        .map((id) => members.find((m) => m.id === id))
        .filter(Boolean);

  function emailHref(person) {
    const shareAmount = (shares[person.id] || 0) / 100;
    return mailtoLink({
      to: person.email,
      subject: expense.type === "loan"
        ? `${payerName} lent you money for "${expense.description}" — ${formatINR(shareAmount)} due`
        : `${payerName} split "${expense.description}" with you — ${formatINR(shareAmount)} due`,
      body: ticketEmailBody({
        expense,
        payerName,
        recipientName: person.isSelf ? "you" : person.name,
        shareAmount,
        formatINR,
      }),
    });
  }

  return (
    <div className="page ticket-page">
      <Ticket expense={expense} group={group} members={members} />

      {owers.length > 0 && (
        <div className="email-box">
          <div className="email-box-title">Email this ticket to whoever owes money</div>
          <div className="email-box-list">
            {owers.map((person) => (
              <a
                key={person.id}
                className={`chip-btn ${person.email ? "" : "chip-btn-disabled"}`}
                href={person.email ? emailHref(person) : undefined}
                onClick={(e) => {
                  if (!person.email) {
                    e.preventDefault();
                    window.alert(`Add an email for ${person.name} on the People page first.`);
                  }
                }}
              >
                ✉️ {person.isSelf ? "You" : person.name}
                {!person.email && " (no email saved)"}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="ticket-actions">
        <button className="secondary-btn" onClick={() => window.print()}>Print / Save as PDF</button>
        <button
          className="secondary-btn"
          onClick={() => {
            if (window.confirm("Delete this entry from the ledger? Balances will update.")) {
              dispatch({ type: "DELETE_EXPENSE", id: expense.id });
              navigate(group ? `/groups/${group.id}` : "/", { replace: true });
            }
          }}
        >
          Delete entry
        </button>
        <Link className="primary-btn" to={group ? `/groups/${group.id}` : "/"}>
          {group ? `Back to ${group.name}` : "Back to dashboard"}
        </Link>
      </div>
    </div>
  );
}