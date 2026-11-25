import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const KEY = "mt_demo_user";
const TOKEN_KEY = "mt_access_token";



function readSavedUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Holds the signed-in user and the access token.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);

  const login = useCallback((u, token) => {
  setUser(u);
  try {
    localStorage.setItem(KEY, JSON.stringify(u));
    if (token) localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}, []);


  const logout = useCallback(() => {
  setUser(null);
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}, []);


  const value = useMemo(
    () => ({ user, login, logout, isAdmin: user?.role === "ADMIN" }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
