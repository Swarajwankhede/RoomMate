import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppState } from "../context/AppContext.jsx";
import { computeNetBalances, simplifyDebts } from "../utils/balances.js";
import { formatINR } from "../utils/constants.js";
import { generateTicketId } from "../utils/ticket.js";
import PairwiseSettleBoard from "../components/PairwiseSettleBoard.jsx";

export default function SettleUp() {
  const { groupId } = useParams();
  const { members, groups, expenses } = useAppState();
  const dispatch = useAppDispatch();

  const group = groups.find((g) => g.id === groupId);
  if (!group) {
    return (
      <div className="empty-state">
        <strong>Group not found</strong>
        <Link to="/groups">Back to groups</Link>
      </div>
    );
  }

  const groupMembers = members.filter((m) => group.memberIds.includes(m.id));
  const groupExpenses = expenses.filter((e) => e.groupId === group.id);

  const net = useMemo(() => computeNetBalances(group.memberIds, groupExpenses), [group, groupExpenses]);
  const transfers = useMemo(() => simplifyDebts(net), [net]);
  const nameOf = (id) => members.find((m) => m.id === id)?.name || "Someone";

  function markPaid(t) {
    dispatch({
      type: "RECORD_SETTLEMENT",
      expense: {
        id: crypto.randomUUID(),
        groupId: group.id,
        ticketId: generateTicketId(),
        description: "Settle up",
        amount: t.amount,
        category: "settlement",
        paidBy: t.from,
        splitBetween: [t.to],
        date: new Date().toISOString().slice(0, 10),
        createdAt: Date.now(),
        isSettlement: true,
      },
    });
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h2>Settle up — {group.name}</h2>
          <p>The fewest transfers needed to zero everyone out.</p>
        </div>
      </div>

      {transfers.length === 0 ? (
        <div className="empty-state">
          <strong>Everyone's square 🎉</strong>
          No transfers are needed right now.
        </div>
      ) : (
        <div className="paper-card">
          <ul className="transfer-list">
            {transfers.map((t, i) => (
              <li className="transfer-row" key={i}>
                <span className="transfer-parties">
                  {nameOf(t.from)}
                  <span className="transfer-arrow">→</span>
                  {nameOf(t.to)}
                </span>
                <span className="transfer-amount">{formatINR(t.amount)}</span>
                <button className="settle-btn" onClick={() => markPaid(t)}>
                  Mark paid
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h3 style={{ marginTop: 32 }}>Between any two people</h3>
      <p style={{ color: "var(--ink-soft)", marginTop: -8 }}>
        If one of you covered coffee and the other covered biscuits, this cancels those out directly.
      </p>
      <PairwiseSettleBoard members={groupMembers} expenses={groupExpenses} />
    </div>
  );
}