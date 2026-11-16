import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const KEY = "mt_demo_user";

function readSavedUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// এখন নকল (demo) login। NestJS API জোড়া লাগলে এখানে JWT বসবে।
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);

  const login = useCallback((u) => {
    setUser(u);
    try {
      localStorage.setItem(KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, isAdmin: user?.role === "admin" }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
