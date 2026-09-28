import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppState } from "../context/AppContext.jsx";
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

  return (
    <div className="page ticket-page">
      <Ticket expense={expense} group={group} members={members} />
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
