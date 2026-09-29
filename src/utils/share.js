// Deep links that make the app useful in real life (India): remind over
// WhatsApp, pay over any UPI app.
export function whatsappLink(phone, text) {
  const digits = (phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function upiLink({ upi, name, amount, note }) {
  return (
    `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(name)}` +
    `&am=${Number(amount).toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`
  );
}

// Opens the person's own email app with the ticket pre-filled — there's no
// backend here, so nothing is sent automatically; they still have to hit
// Send themselves.
export function mailtoLink({ to, subject, body }) {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${encodeURIComponent(to)}?${params.toString().replace(/\+/g, "%20")}`;
}
