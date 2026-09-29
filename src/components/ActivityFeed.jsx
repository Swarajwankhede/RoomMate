import React, { useEffect, useState } from "react";
import { timeAgo } from "../utils/time.js";
import { formatINR } from "../utils/constants.js";

export default function ActivityFeed({ members, expenses }) {
  const [, forceTick] = useState(0);

  // Re-render every 30s purely so "x minutes ago" labels stay fresh.
  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const nameOf = (id) => members.find((m) => m.id === id)?.name || "Someone";
  const recent = [...expenses].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="empty-state">
        <strong>It's quiet in here</strong>
        Activity from every group will show up here as it happens.
      </div>
    );
  }

  return (
    <ul className="activity-feed">
      {recent.map((e) => (
        <li key={e.id} className="activity-item">
          <span className={`activity-dot ${e.isSettlement ? "settlement" : ""}`} />
          <span className="activity-text">
            <strong>{nameOf(e.paidBy)}</strong> {e.isSettlement ? "settled up with" : e.type === "loan" ? "lent money for" : "paid for"}{" "}
            <strong>{e.isSettlement ? nameOf(e.splitBetween[0]) : e.description}</strong> —{" "}
            {formatINR(e.amount)}
          </span>
          <span className="activity-time">{timeAgo(e.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}