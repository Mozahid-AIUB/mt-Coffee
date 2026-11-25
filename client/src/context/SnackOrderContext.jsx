import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { getAdminOrders } from "../api/adminSnacksApi";
import { isPushSupported, getPermission, subscribe } from "../utils/push";
import { isPushOptedOut } from "../utils/pushPrefs";

const SnackOrderContext = createContext(null);

// Beep for a new order, built with the Web Audio API so no sound file is needed
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.value = 0.15;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ignore when audio will not play
  }
}

export function SnackOrderProvider({ children }) {
  const { user, isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const prevCountRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const orders = await getAdminOrders();
      const count = orders.filter((o) => o.status === "PENDING").length;
      // Beep when a new pending order arrives
      if (count > prevCountRef.current && prevCountRef.current >= 0) {
        playBeep();
      }
      prevCountRef.current = count;
      setPendingCount(count);
    } catch {
      // ignore
    }
  }, [isAdmin]);

  // Poll every 10 seconds
  useEffect(() => {
    if (!isAdmin) return;
    refresh();
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, [isAdmin, refresh]);

  // Subscribe to push on login, unless the user turned it off.
  // Admins hear about new orders; employees hear about new menus.
  // The browser can hold a subscription the server does not know about,
  // so call subscribe() every time; the API upserts a repeated endpoint.
  const pushTriedRef = useRef(false);
  useEffect(() => {
    if (!user || !isPushSupported()) return;
    if (getPermission() === "denied") return;
    if (isPushOptedOut()) return;
    if (pushTriedRef.current) return; // StrictMode runs effects twice
    pushTriedRef.current = true;
    subscribe().catch(() => {
      // On an expired token or a refused permission, allow a later retry.
      // The toggle on the Snack Orders page can turn it on as well.
      pushTriedRef.current = false;
    });
  }, [user]);

  return (
    <SnackOrderContext.Provider value={{ pendingCount, refresh }}>
      {children}
    </SnackOrderContext.Provider>
  );
}

export function useSnackOrders() {
  const ctx = useContext(SnackOrderContext);
  if (!ctx) throw new Error("useSnackOrders must be used inside SnackOrderProvider");
  return ctx;
}
