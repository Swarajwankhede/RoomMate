import { formatINR } from "./constants.js";
import { isSettled, splitPaise, toPaise, toRupees } from "./money.js";

// ---------------------------------------------------------------------
// Ledger rules
//  * Every expense has one payer and is split equally across `splitBetween`
//    (in exact paise, so ₹199 between two people is ₹99.50 each).
//  * Expenses flagged `cashSettled` were paid back on the spot: no dues.
//  * Settlements are stored as ordinary expenses (payer -> receiver), so
//    paying someone back automatically reduces what you owe.
//  * Dues are ALWAYS netted per pair of people: if you bought Rahul coffee
//    and he bought you biscuits, only the difference is left.
// ---------------------------------------------------------------------

/** Each person's exact share of an expense, in paise: { personId: paise } */
export const expenseSharesPaise = (e) => splitPaise(toPaise(e.amount), e.splitBetween);

/** Net position per member over the given expenses, in rupees. */
export function computeNetBalances(memberIds, expenses) {
  const net = {};
  memberIds.forEach((id) => (net[id] = 0));
  expenses.forEach((e) => {
    if (e.cashSettled) return;
    net[e.paidBy] = (net[e.paidBy] || 0) + toPaise(e.amount);
    Object.entries(expenseSharesPaise(e)).forEach(([id, p]) => {
      net[id] = (net[id] || 0) - p;
    });
  });
  const rupees = {};
  Object.entries(net).forEach(([id, p]) => (rupees[id] = toRupees(p)));
  return rupees;
}

/**
 * Every expense that moved money between `me` and `other`.
 * delta > 0 -> `other` owes `me` more | delta < 0 -> `me` owes `other` more
 */
export function pairEntries(expenses, me, other) {
  const out = [];
  if (me === other) return out;
  expenses.forEach((e) => {
    if (e.cashSettled) return;
    const shares = expenseSharesPaise(e);
    let deltaPaise = 0;
    if (e.paidBy === me && shares[other] !== undefined) deltaPaise = shares[other];
    else if (e.paidBy === other && shares[me] !== undefined) deltaPaise = -shares[me];
    if (deltaPaise !== 0) out.push({ expense: e, deltaPaise, delta: toRupees(deltaPaise) });
  });
  return out;
}

const pairBalancePaise = (expenses, me, other) =>
  pairEntries(expenses, me, other).reduce((s, x) => s + x.deltaPaise, 0);

/** Positive = `other` owes `me`. Negative = `me` owes `other`. (rupees) */
export const pairBalance = (expenses, me, other) => toRupees(pairBalancePaise(expenses, me, other));

/** All open dues, netted per pair: [{ from, to, amount }] where `from` owes `to`. */
export function computePairwiseNet(expenses) {
  const ids = new Set();
  expenses.forEach((e) => {
    ids.add(e.paidBy);
    e.splitBetween.forEach((id) => ids.add(id));
  });
  const list = [...ids];
  const results = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      const bal = pairBalancePaise(expenses, a, b); // > 0 : b owes a
      if (bal > 0) results.push({ from: b, to: a, amount: toRupees(bal) });
      else if (bal < 0) results.push({ from: a, to: b, amount: toRupees(-bal) });
    }
  }
  return results.sort((x, y) => y.amount - x.amount);
}

/** Preview: how the payer's dues with each participant change if this expense is added. */
export function dueImpact(expenses, payerId, splitBetween, amount) {
  const shares = splitPaise(toPaise(amount), splitBetween);
  return splitBetween
    .filter((id) => id !== payerId)
    .map((id) => {
      const before = pairBalancePaise(expenses, payerId, id);
      return { id, before: toRupees(before), after: toRupees(before + shares[id]) };
    });
}

/** Human sentence for a pair balance, e.g. "Rahul owes you ₹60". */
export function describeBalance(balance, otherName, meName = "You") {
  if (isSettled(balance)) return "settled up";
  const amt = formatINR(Math.abs(balance));
  const [debtor, creditor] = balance > 0 ? [otherName, meName] : [meName, otherName];
  const verb = debtor === "You" ? "owe" : "owes";
  const object = creditor === "You" ? "you" : creditor;
  return `${debtor} ${verb} ${object} ${amt}`;
}
