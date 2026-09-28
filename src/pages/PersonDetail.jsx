import React from "react";
import { Link, useParams } from "react-router-dom";
import { useAppState } from "../context/AppContext.jsx";
import { describeBalance, pairBalance } from "../utils/balances.js";
import { formatINR, relationMeta } from "../utils/constants.js";
import { isSettled, toPaise } from "../utils/money.js";
import { upiLink, whatsappLink } from "../utils/share.js";
import DueBreakdown from "../components/DueBreakdown.jsx";
import SettleForm from "../components/SettleForm.jsx";

export default function PersonDetail() {
  const { personId } = useParams();
  const { members, expenses } = useAppState();
  const self = members.find((m) => m.isSelf);
  const person = members.find((m) => m.id === personId && !m.isSelf);

  if (!person) {
    return (
      <div className="empty-state">
        <strong>Person not found</strong>
        <Link to="/people">Back to people</Link>
      </div>
    );
  }

  const balance = pairBalance(expenses, self.id, person.id);
  const owed = Math.abs(balance);
  const settled = isSettled(balance);
  const relation = relationMeta(person.relation);
  const status = settled ? "even" : balance > 0 ? "credit" : "debit";

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <h2>
            {person.name}{" "}
            <span className="relation-chip" style={{ color: relation.color, borderColor: relation.color }}>
              {relation.label}
            </span>
          </h2>
          <p>Every coffee, bill, and repayment between the two of you.</p>
        </div>
        <Link className="primary-btn" to="/add-expense">+ Add expense</Link>
      </div>

      <div className={`balance-hero ${status}`}>
        <div className="balance-hero-label">Right now</div>
        <div className="balance-hero-text">{describeBalance(balance, person.name)}</div>
        {!settled && <div className={`balance-hero-amount ${status}`}>{formatINR(owed)}</div>}
        <div className="due-actions" style={{ marginTop: 12 }}>
          {balance > 0 && (
            <a className="chip-btn" target="_blank" rel="noreferrer"
              href={whatsappLink(person.phone, `Hey ${person.name}! Friendly reminder from RoomMate: you owe me ${formatINR(owed)}. Thanks 🙏`)}>
              💬 Remind on WhatsApp
            </a>
          )}
          {balance < 0 && person.upi && (
            <a className="chip-btn" href={upiLink({ upi: person.upi, name: person.name, amount: owed, note: "RoomMate settle up" })}>
              📲 Pay {formatINR(owed)} via UPI
            </a>
          )}
        </div>
      </div>

      <SettleForm key={toPaise(balance)} me={self} other={person} balance={balance} />

      <h3 style={{ marginTop: 28 }}>How this adds up</h3>
      <p className="muted" style={{ marginTop: -6 }}>
        Things you paid for them count in your favour; things they paid for you are deducted automatically.
      </p>
      <DueBreakdown expenses={expenses} me={self} other={person} />
    </div>
  );
}
