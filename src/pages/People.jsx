import React from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppState } from "../context/AppContext.jsx";
import { describeBalance, pairBalance } from "../utils/balances.js";
import { relationMeta } from "../utils/constants.js";
import MemberForm from "../components/MemberForm.jsx";

export default function People() {
  const { members, expenses } = useAppState();
  const dispatch = useAppDispatch();
  const self = members.find((m) => m.isSelf);
  const others = members.filter((m) => !m.isSelf);

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h2>People</h2>
          <p>Friends, family, flatmates, colleagues — anyone you share costs with.</p>
        </div>
      </div>

      <div className="paper-card">
        <MemberForm />
      </div>

      {others.length > 0 && (
        <div className="member-list">
          {others.map((m) => {
            const relation = relationMeta(m.relation);
            const balance = pairBalance(expenses, self.id, m.id);
            const inUse = expenses.some((e) => e.paidBy === m.id || e.splitBetween.includes(m.id));
            return (
              <div className="member-row" key={m.id}>
                <div>
                  <div className="name-row" style={{ marginBottom: 2 }}>
                    <span className="avatar-dot" style={{ background: m.color }} />
                    <Link to={`/people/${m.id}`}><strong>{m.name}</strong></Link>
                    <span className="relation-chip" style={{ color: relation.color, borderColor: relation.color }}>
                      {relation.label}
                    </span>
                  </div>
                  <div className={`muted ${balance > 0 ? "credit" : balance < 0 ? "debit" : ""}`}>
                    {describeBalance(balance, m.name)}
                  </div>
                </div>
                <div className="member-actions">
                  <Link className="chip-btn solid" to={`/people/${m.id}`}>Open ledger</Link>
                  <button
                    className="delete-btn"
                    disabled={inUse}
                    title={inUse ? "Has expenses in the ledger, so they can't be removed" : "Remove"}
                    onClick={() => dispatch({ type: "REMOVE_MEMBER", id: m.id })}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
