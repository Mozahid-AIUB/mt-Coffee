import { useCallback, useEffect, useState } from "react";
import { Clock, X } from "lucide-react";
import { motion } from "motion/react";
import { getItems, placeOrder, getMyOrders, cancelOrder } from "../api/snacksApi";
import { snackServiceOpen, formatClock } from "../utils/dhaka";
import { useNow } from "../hooks/useNow";
import { popupConfirm, popupError, popupQuick } from "../utils/popup";
import StatusBadge from "../components/StatusBadge";
import SnackItemCard from "../components/SnackItemCard";

// একটা অর্ডার row
function OrderRow({ order, onCancel }) {
  const [busy, setBusy] = useState(false);
  const time = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const optText = order.options
    ? Object.values(order.options).join(", ")
    : "";

  const handleCancel = async () => {
    const ok = await popupConfirm("Cancel this order?", `${order.itemName} × ${order.quantity}`, "Yes, cancel");
    if (!ok) return;
    setBusy(true);
    try {
      await onCancel(order.id);
      popupQuick("Order cancelled");
    } catch (e) {
      popupError("Could not cancel", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{order.itemName}</span>
          <span className="text-xs text-muted">× {order.quantity}</span>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-0.5 text-xs text-muted truncate">
          {optText}{optText && " · "}{order.location}
          {order.note && ` · "${order.note}"`}
        </p>
        <p className="mt-0.5 text-xs text-muted">{time}</p>
      </div>
      {order.status === "PENDING" && (
        <button
          type="button"
          disabled={busy}
          onClick={handleCancel}
          className="grid size-8 shrink-0 place-items-center rounded-xl text-danger transition hover:bg-danger/10 disabled:opacity-50"
          aria-label="Cancel order"
        >
          <X className="size-4" />
        </button>
      )}
    </motion.div>
  );
}

// Skeleton
function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-3xl border border-border bg-surface-2/60" />
      ))}
    </div>
  );
}

// ========== Main Page ==========
export default function Snacks() {
  const [items, setItems] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const tick = useNow(10000); // প্রতি ১০ সেকেন্ডে update

  const isOpen = snackServiceOpen(tick);

  const load = useCallback(async () => {
    try {
      const [it, ord] = await Promise.all([getItems(), getMyOrders()]);
      setItems(it);
      setOrders(ord);
      setError("");
    } catch {
      setError("Could not load snacks. Please try again.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // নতুন orders দেখতে poll করি
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const ord = await getMyOrders();
        setOrders(ord);
      } catch { /* ignore */ }
    }, 15000);
    return () => clearInterval(id);
  }, []);

  const handleOrder = async (data) => {
    await placeOrder(data);
    const ord = await getMyOrders();
    setOrders(ord);
  };

  const handleCancel = async (orderId) => {
    await cancelOrder(orderId);
    const ord = await getMyOrders();
    setOrders(ord);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Snacks</h1>
      <p className="mt-1 text-sm text-muted">
        Order tea or coffee between 8:00 AM and 8:00 PM.
      </p>

      {/* সার্ভিস status ব্যানার */}
      <div
        className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${
          isOpen
            ? "bg-success/15 text-success"
            : "bg-surface-2 text-muted"
        }`}
      >
        <Clock className="size-4 shrink-0" aria-hidden />
        {isOpen
          ? `Open now, until 8:00 PM`
          : "Closed. Opens at 8:00 AM"}
        <span className="ml-auto text-xs opacity-70">{formatClock(tick)}</span>
      </div>

      <div className="mt-6">
        {error ? (
          <div className="rounded-3xl border border-danger/40 bg-danger/10 p-6 text-center">
            <p className="text-sm text-danger">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-3 h-10 rounded-xl bg-accent px-5 text-sm font-medium text-accent-fg"
            >
              Try again
            </button>
          </div>
        ) : !items ? (
          <Skeleton />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <SnackItemCard key={item.id} item={item} isOpen={isOpen} onOrder={handleOrder} />
            ))}
          </div>
        )}
      </div>

      {/* আজকের অর্ডার */}
      {orders.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">My Orders Today</h2>
          <div className="space-y-2">
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} onCancel={handleCancel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
