import React, { useMemo } from "react";
import { formatINR } from "../utils/constants.js";

export default function PaymentChart({ members, expenses }) {
  const totals = useMemo(() => {
    const map = {};
    members.forEach((m) => (map[m.id] = 0));
    expenses.forEach((e) => {
      if (e.isSettlement || e.type === "loan") return;
      map[e.paidBy] = (map[e.paidBy] || 0) + e.amount;
    });
    return members.map((m) => ({ ...m, total: map[m.id] || 0 })).sort((a, b) => b.total - a.total);
  }, [members, expenses]);

  const max = Math.max(1, ...totals.map((t) => t.total));

  if (totals.every((t) => t.total === 0)) {
    return (
      <div className="empty-state">
        <strong>No spending yet</strong>
        Once expenses are logged, this shows who's paid the most, all time.
      </div>
    );
  }

  return (
    <div className="bar-chart">
      {totals.map((t) => (
        <div className="bar-row" key={t.id}>
          <span className="bar-label">{t.name}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(t.total / max) * 100}%`, background: t.color }} />
          </div>
          <span className="bar-value">{formatINR(t.total)}</span>
        </div>
      ))}
    </div>
  );
}