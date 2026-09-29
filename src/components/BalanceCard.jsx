import React from "react";
import { formatINR, relationMeta } from "../utils/constants.js";

export default function BalanceCard({ member, amount }) {
  const isEven = Math.abs(amount) < 0.5;
  const status = isEven ? "even" : amount > 0 ? "credit" : "debit";
  const caption = isEven ? "All settled up" : amount > 0 ? "is owed" : "owes the group";
  const relation = relationMeta(member.relation);

  return (
    <div className="balance-card">
      <div className="name-row">
        <span className="avatar-dot" style={{ background: member.color }} />
        <span className="name">{member.name}</span>
        <span className="relation-chip" style={{ color: relation.color, borderColor: relation.color }}>
          {relation.label}
        </span>
      </div>
      <div className={`amount ${status}`}>{formatINR(Math.abs(amount))}</div>
      <div className="caption">{caption}</div>
    </div>
  );
}