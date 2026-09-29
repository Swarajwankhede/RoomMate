// All ledger maths is done in integer PAISE (1 rupee = 100 paise) so amounts
// like ₹199 split two ways are exactly ₹99.50 each, with no rounding drift.
export const toPaise = (rupees) => Math.round(Number(rupees) * 100);
export const toRupees = (paise) => paise / 100;
export const roundRupees = (rupees) => toRupees(toPaise(rupees));
export const isSettled = (rupees) => toPaise(rupees) === 0;

/**
 * Split a total (in paise) across people so the shares add up EXACTLY to the
 * total. 199 / 2 -> 99.50 + 99.50. 100 / 3 -> 33.34 + 33.33 + 33.33
 * (the odd paisa goes to the first people in the list).
 */
export function splitPaise(totalPaise, ids) {
  const out = {};
  if (!ids.length) return out;
  const base = Math.floor(totalPaise / ids.length);
  let remainder = totalPaise - base * ids.length;
  ids.forEach((id) => {
    out[id] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  });
  return out;
}
