import React, { createContext, useContext, useEffect, useReducer } from "react";

const AVATAR_COLORS = ["#4C5FD5", "#E0607E", "#1F9D66", "#F2A93B", "#3E8FD1", "#B173D6"];

// Each account gets its own ledger in localStorage.
const storageKey = (userId) => `roommate-ledger-v3-${userId}`;

function init(user) {
  try {
    const raw = localStorage.getItem(storageKey(user.id));
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read saved ledger, starting fresh.", err);
  }
  // Fresh account: the logged-in user is the first "person" (isSelf).
  return {
    members: [
      { id: crypto.randomUUID(), name: user.name, relation: "self", isSelf: true, color: AVATAR_COLORS[0] },
    ],
    groups: [],
    expenses: [],
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_MEMBER": {
      const member = {
        id: crypto.randomUUID(),
        name: action.name,
        relation: action.relation,
        phone: action.phone || "",
        upi: action.upi || "",
        color: AVATAR_COLORS[state.members.length % AVATAR_COLORS.length],
      };
      return { ...state, members: [...state.members, member] };
    }
    case "REMOVE_MEMBER": {
      const target = state.members.find((m) => m.id === action.id);
      const inUse = state.expenses.some((e) => e.paidBy === action.id || e.splitBetween.includes(action.id));
      if (!target || target.isSelf || inUse) return state; // keep ledger history intact
      return {
        ...state,
        members: state.members.filter((m) => m.id !== action.id),
        groups: state.groups.map((g) => ({ ...g, memberIds: g.memberIds.filter((id) => id !== action.id) })),
      };
    }
    case "ADD_GROUP": {
      const group = {
        id: crypto.randomUUID(),
        name: action.name,
        category: action.category,
        memberIds: action.memberIds,
        createdAt: Date.now(),
      };
      return { ...state, groups: [...state.groups, group] };
    }
    case "DELETE_GROUP":
      // Expenses stay in the ledger; they simply become "no group".
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.id),
        expenses: state.expenses.map((e) => (e.groupId === action.id ? { ...e, groupId: null } : e)),
      };
    case "ADD_EXPENSE":
    case "RECORD_SETTLEMENT":
      return { ...state, expenses: [action.expense, ...state.expenses] };
    case "DELETE_EXPENSE":
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) };
    default:
      return state;
  }
}

const StateCtx = createContext(null);
const DispatchCtx = createContext(null);

export function AppProvider({ user, children }) {
  const [state, dispatch] = useReducer(reducer, user, init);

  useEffect(() => {
    localStorage.setItem(storageKey(user.id), JSON.stringify(state));
  }, [state, user.id]);

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

export function useAppDispatch() {
  const ctx = useContext(DispatchCtx);
  if (!ctx) throw new Error("useAppDispatch must be used within AppProvider");
  return ctx;
}

/** Convenience: the logged-in user's own member record. */
export function useSelf() {
  const { members } = useAppState();
  return members.find((m) => m.isSelf);
}
