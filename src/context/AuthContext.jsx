import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  clearSession,
  getSessionUser,
  loginUser,
  registerUser,
  saveSession,
} from "../utils/auth.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSessionUser());

  const register = useCallback(async (fields) => {
    const created = await registerUser(fields);
    saveSession(created.id);
    setUser(created);
  }, []);

  const login = useCallback(async (fields) => {
    const found = await loginUser(fields);
    saveSession(found.id);
    setUser(found);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, register, login, logout }), [user, register, login, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
