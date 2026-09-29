import React from "react";
import { Link } from "react-router-dom";
import { computePairwiseNet } from "../utils/balances.js";
import { formatINR } from "../utils/constants.js";
import { upiLink, whatsappLink } from "../utils/share.js";

// Every open due, netted per pair. Rows involving you get action buttons.
export default function DuesList({ members, expenses, onlyMine = false, emptyText }) {
  const self = members.find((m) => m.isSelf);
  const byId = (id) => members.find((m) => m.id === id);
  let pairs = computePairwiseNet(expenses);
  if (onlyMine) pairs = pairs.filter((p) => p.from === self.id || p.to === self.id);

  if (pairs.length === 0) {
    return (
      <div className="empty-state">
        <strong>All settled up 🎉</strong>
        {emptyText || "Nobody owes anybody anything right now."}
      </div>
    );
  }

  return (
    <ul className="dues-list">
      {pairs.map((p) => {
        const from = byId(p.from);
        const to = byId(p.to);
        if (!from || !to) return null;
        const iOwe = from.id === self.id;
        const owedToMe = to.id === self.id;
        const other = iOwe ? to : from;

        return (
          <li className="due-row" key={`${p.from}-${p.to}`}>
            <div className="due-main">
              <span className="avatar-dot" style={{ background: other.color }} />
              <div>
                <div className="due-line">
                  <strong>{iOwe ? "You" : from.name}</strong> {iOwe ? "owe" : "owes"}{" "}
                  <strong>{owedToMe ? "you" : to.name}</strong>
                </div>
                {(iOwe || owedToMe) && (
                  <Link className="due-link" to={`/people/${other.id}`}>See how this adds up →</Link>
                )}
              </div>
            </div>
            <div className={`due-amount ${iOwe ? "debit" : owedToMe ? "credit" : ""}`}>{formatINR(p.amount)}</div>
            <div className="due-actions">
              {owedToMe && (
                <a
                  className="chip-btn"
                  target="_blank"
                  rel="noreferrer"
                  href={whatsappLink(
                    other.phone,
                    `Hey ${other.name}! Friendly reminder from RoomMate: you owe me ${formatINR(p.amount)}. Thanks 🙏`
                  )}
                >
                  💬 Remind
                </a>
              )}
              {iOwe && other.upi && (
                <a
                  className="chip-btn"
                  href={upiLink({ upi: other.upi, name: other.name, amount: p.amount, note: "RoomMate settle up" })}
                >
                  📲 Pay via UPI
                </a>
              )}
              {(iOwe || owedToMe) && (
                <Link className="chip-btn solid" to={`/people/${other.id}`}>Settle</Link>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
