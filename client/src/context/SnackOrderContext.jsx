import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { getAdminOrders } from "../api/adminSnacksApi";
import { isPushSupported, getPermission, subscribe } from "../utils/push";
import { isPushOptedOut } from "../utils/pushPrefs";

const SnackOrderContext = createContext(null);

// নতুন অর্ডারের "beep" শব্দ — Web Audio API, কোনো ফাইল লাগে না
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
    // audio না চললে চুপচাপ ignore
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
      // নতুন pending order আসলে beep বাজাও
      if (count > prevCountRef.current && prevCountRef.current >= 0) {
        playBeep();
      }
      prevCountRef.current = count;
      setPendingCount(count);
    } catch {
      // ignore
    }
  }, [isAdmin]);

  // ১০ সেকেন্ড পর পর poll
  useEffect(() => {
    if (!isAdmin) return;
    refresh();
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, [isAdmin, refresh]);

  // লগইন করলেই push চালু করে দিই — নিজে বন্ধ করে থাকলে ছাড়া।
  // admin নতুন অর্ডারের খবর পায়, কর্মীরা নতুন আইটেমের খবর পায়।
  // browser-এ subscription থাকলেও সার্ভারে নাও থাকতে পারে, তাই প্রতিবার
  // subscribe() ডাকি — একই endpoint হলে ব্যাকএন্ড upsert করে নেয়।
  const pushTriedRef = useRef(false);
  useEffect(() => {
    if (!user || !isPushSupported()) return;
    if (getPermission() === "denied") return;
    if (isPushOptedOut()) return;
    if (pushTriedRef.current) return; // StrictMode-এ effect দুবার চলে
    pushTriedRef.current = true;
    subscribe().catch(() => {
      // token expire বা permission না পেলে পরের বার আবার চেষ্টা করতে দিই —
      // admin চাইলে Snack Orders পেজের toggle থেকেও চালু করতে পারবে
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
