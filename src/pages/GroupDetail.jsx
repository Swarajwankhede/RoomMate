import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppState } from "../context/AppContext.jsx";
import { computeNetBalances, expenseSharesPaise } from "../utils/balances.js";
import { formatINR, groupCategoryMeta } from "../utils/constants.js";
import { isSettled, toRupees } from "../utils/money.js";
import { whatsappLink } from "../utils/share.js";

export default function GroupDetail() {
  const { groupId } = useParams();
  const { members, groups, expenses } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const group = groups.find((g) => g.id === groupId);
  if (!group) {
    return (
      <div className="empty-state">
        <strong>Group not found</strong>
        It may have been deleted. <Link to="/groups">Back to groups</Link>
      </div>
    );
  }

  const groupMembers = members.filter((m) => group.memberIds.includes(m.id));
  const groupExpenses = expenses.filter((e) => e.groupId === group.id);
  const spend = groupExpenses.filter((e) => !e.isSettlement);
  const net = computeNetBalances(group.memberIds, groupExpenses);
  const cat = groupCategoryMeta(group.category);
  const nameOf = (id) => members.find((m) => m.id === id)?.name || "Someone";

  // "Split view": what each person paid vs. what their fair share was.
  const rows = groupMembers.map((m) => {
    const paid = spend.filter((e) => e.paidBy === m.id).reduce((s, e) => s + e.amount, 0);
    const share = toRupees(
      spend.reduce((sum, e) => sum + (expenseSharesPaise(e)[m.id] || 0), 0)
    );
    return { m, paid, share, net: net[m.id] || 0 };
  });

  const summary =
    `${group.name} — expense split (RoomMate)\n` +
    rows.map((r) => `${r.m.name}: paid ${formatINR(r.paid)}, share ${formatINR(r.share)}`).join("\n");

  function removeGroup() {
    if (window.confirm(`Delete "${group.name}"? Its expenses stay in your ledger as "no group".`)) {
      dispatch({ type: "DELETE_GROUP", id: group.id });
      navigate("/groups");
    }
  }

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h2>{cat.icon} {group.name}</h2>
          <p>{groupMembers.map((m) => m.name).join(", ")}</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="secondary-btn" target="_blank" rel="noreferrer" href={whatsappLink("", summary)}>
            💬 Share split
          </a>
          <Link className="primary-btn" to={`/add-expense?group=${group.id}`}>+ Add expense</Link>
        </div>
      </div>

      <h3>Who paid, who owes their share</h3>
      <div className="table-wrap">
        <table className="split-table">
          <thead>
            <tr><th>Person</th><th>Paid</th><th>Their share</th><th>Balance</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.m.id}>
                <td><span className="avatar-dot" style={{ background: r.m.color }} /> {r.m.isSelf ? "You" : r.m.name}</td>
                <td>{formatINR(r.paid)}</td>
                <td>{formatINR(r.share)}</td>
                <td className={r.net > 0 ? "credit" : r.net < 0 ? "debit" : ""}>
                  {isSettled(r.net) ? "settled" : `${r.net > 0 ? "gets back" : "owes"} ${formatINR(Math.abs(r.net))}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">
        Balances here cover this group's expenses only. To pay people back, use <Link to="/settle">Settle up</Link>.
      </p>

      <h3 style={{ marginTop: 28 }}>Expenses in this group</h3>
      {groupExpenses.length === 0 ? (
        <div className="empty-state">
          <strong>Nothing logged yet</strong>
          Add the first expense for {group.name}.
        </div>
      ) : (
        <ul className="ledger-list">
          {groupExpenses.map((e) => (
            <li className="ledger-row" key={e.id}>
              <span className="date">{new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              <span className="desc">
                <strong>{e.description}</strong>
                <span>Split: {e.splitBetween.map(nameOf).join(", ")}</span>
              </span>
              <span className="paid-by">Paid by {nameOf(e.paidBy)}</span>
              <span className="amount">
                {formatINR(e.amount)}
                <div><Link className="delete-btn" to={`/ticket/${e.id}`}>View ticket</Link></div>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 28 }}>
        <button className="delete-btn" onClick={removeGroup}>Delete this group</button>
      </div>
    </div>
  );
}
