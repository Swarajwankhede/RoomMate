import React, { useMemo } from "react";
import { computePairwiseNet } from "../utils/balances.js";
import { formatINR } from "../utils/constants.js";

export default function PairwiseSettleBoard({ members, expenses }) {
  const pairs = useMemo(() => computePairwiseNet(expenses), [expenses]);
  const nameOf = (id) => members.find((m) => m.id === id)?.name || "Someone";

  if (pairs.length === 0) {
    return (
      <div className="empty-state">
        <strong>No direct dues between pairs</strong>
        When two people repeatedly pay for each other — like coffee one day and
        biscuits the next — this board nets those out automatically.
      </div>
    );
  }

  return (
    <div className="pairwise-grid">
      {pairs.map((p, i) => (
        <div className="pairwise-card" key={i}>
          <div className="pairwise-names">
            <strong>{nameOf(p.from)}</strong> owes <strong>{nameOf(p.to)}</strong>
          </div>
          <div className="pairwise-amount">{formatINR(p.amount)}</div>
          <div className="pairwise-note">Netted across every expense directly between these two</div>
        </div>
      ))}
    </div>
  );
}