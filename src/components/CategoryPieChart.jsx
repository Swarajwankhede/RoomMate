import React, { useMemo } from "react";
import { EXPENSE_CATEGORIES, categoryMeta, formatINR } from "../utils/constants.js";

// A pure-CSS pie/donut chart: each category's slice is a conic-gradient
// segment whose angular width is exactly proportional to its share of
// total spend, so the chart's own geometry does the "which category ate
// how much of the pie" work — no charting library needed.
export default function CategoryPieChart({ expenses }) {
  const { slices, total } = useMemo(() => {
    const totals = {};
    let sum = 0;
    expenses
      .filter((e) => !e.isSettlement && e.type !== "loan")
      .forEach((e) => {
        totals[e.category] = (totals[e.category] || 0) + e.amount;
        sum += e.amount;
      });

    const ordered = EXPENSE_CATEGORIES.map((c) => ({ ...c, amount: totals[c.id] || 0 })).filter(
      (c) => c.amount > 0
    );
    ordered.sort((a, b) => b.amount - a.amount);
    return { slices: ordered, total: sum };
  }, [expenses]);

  if (total === 0) {
    return (
      <div className="empty-state">
        <strong>No spending yet</strong>
        Once expenses are logged, this chart shows which categories your money goes to.
      </div>
    );
  }

  // Build the conic-gradient stops: each slice occupies a % of the circle
  // equal to its share of total spend, placed back-to-back around 360°.
  let cursor = 0;
  const stops = slices.map((s) => {
    const pct = (s.amount / total) * 100;
    const start = cursor;
    const end = cursor + pct;
    cursor = end;
    return `${s.color} ${start}% ${end}%`;
  });
  const gradient = `conic-gradient(${stops.join(", ")})`;

  return (
    <div className="pie-chart-row">
      <div className="pie-chart" style={{ background: gradient }} role="img" aria-label="Spending by category">
        <div className="pie-chart-hole">
          <span className="pie-chart-total">{formatINR(total)}</span>
          <span className="pie-chart-total-label">total spent</span>
        </div>
      </div>
      <ul className="pie-legend">
        {slices.map((s) => {
          const pct = Math.round((s.amount / total) * 100);
          return (
            <li key={s.id}>
              <span className="legend-swatch" style={{ background: s.color }} />
              <span className="legend-label">
                {s.icon} {s.label}
              </span>
              <span className="legend-pct">{pct}%</span>
              <span className="legend-amount">{formatINR(s.amount)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}