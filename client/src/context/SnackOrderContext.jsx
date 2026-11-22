import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { getAdminOrders } from "../api/adminSnacksApi";

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
  const { isAdmin } = useAuth();
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
