export const EXPENSE_CATEGORIES = [
  { id: "food", label: "Food & Chai", icon: "☕", color: "#F2994A" },
  { id: "rent", label: "Rent", icon: "🏠", color: "#7C6FE0" },
  { id: "groceries", label: "Groceries", icon: "🛒", color: "#43B27C" },
  { id: "utilities", label: "Bills", icon: "💡", color: "#3E8FD1" },
  { id: "travel", label: "Travel", icon: "🚕", color: "#E0607E" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", color: "#B173D6" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#E0A83E" },
  { id: "other", label: "Other", icon: "📦", color: "#8B93A6" },
];

export const GROUP_CATEGORIES = [
  { id: "home", label: "Home / Flatmates", icon: "🏡", color: "#4C5FD5" },
  { id: "trip", label: "Trip", icon: "✈️", color: "#E0607E" },
  { id: "office", label: "Office", icon: "💼", color: "#3E8FD1" },
  { id: "friends", label: "Friends", icon: "🎉", color: "#F2A93B" },
  { id: "family", label: "Family", icon: "❤️", color: "#E14F4F" },
  { id: "other", label: "Other", icon: "📁", color: "#8B93A6" },
];

// Relations you can pick when adding a person ("self" is created automatically).
export const RELATIONS = [
  { id: "friend", label: "Friend", color: "#4C5FD5" },
  { id: "family", label: "Family", color: "#E0607E" },
  { id: "roommate", label: "Roommate", color: "#1F9D66" },
  { id: "colleague", label: "Colleague", color: "#8B93A6" },
];

const SELF_RELATION = { id: "self", label: "You", color: "#4C5FD5" };

export function formatINR(amount) {
  // Whole rupees show as ₹100, anything with paise shows both digits: ₹99.50
  const paise = Math.round(Number(amount) * 100);
  const hasPaise = paise % 100 !== 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: hasPaise ? 2 : 0,
  }).format(paise / 100);
}

export function categoryMeta(id) {
  return EXPENSE_CATEGORIES.find((c) => c.id === id) || EXPENSE_CATEGORIES.at(-1);
}
export function relationMeta(id) {
  if (id === "self") return SELF_RELATION;
  return RELATIONS.find((r) => r.id === id) || RELATIONS.at(-1);
}
export function groupCategoryMeta(id) {
  return GROUP_CATEGORIES.find((g) => g.id === id) || GROUP_CATEGORIES.at(-1);
}
