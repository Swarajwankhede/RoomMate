export function generateTicketId() {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RM-${time}-${rand}`;
}

// Plain-text email body for a ticket, addressed to one person who owes
// their share. Kept simple since mailto: bodies can't have real formatting.
export function ticketEmailBody({ expense, payerName, recipientName, shareAmount, formatINR }) {
  return (
    `Hi ${recipientName},\n\n` +
    (expense.type === "loan"
      ? `${payerName} lent money for "${expense.description}" (total ${formatINR(expense.amount)}).\n\n` +
        `Amount to pay back: ${formatINR(shareAmount)}\n`
      : `${payerName} paid ${formatINR(expense.amount)} for "${expense.description}" ` +
        `and it was split between everyone selected.\n\n` +
        `Your share: ${formatINR(shareAmount)}\n`) +
    `Ticket ID: ${expense.ticketId}\n` +
    `Date: ${new Date(expense.date).toLocaleDateString("en-IN")}\n\n` +
    `— Sent from RoomMate`
  );
}