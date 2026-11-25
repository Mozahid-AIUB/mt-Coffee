import { useCallback, useEffect, useRef, useState } from "react";
import { Coffee, Filter, Calendar, RefreshCw, Bell, BellOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAdminOrders, updateOrderStatus } from "../api/adminSnacksApi";
import { useSnackOrders } from "../context/SnackOrderContext";
import { isPushOptedOut, setPushOptOut } from "../utils/pushPrefs";
import { todayYmd } from "../utils/dhaka";
import { popupConfirm, popupError } from "../utils/popup";
import StatusBadge from "../components/StatusBadge";
import { ToastContainer } from "../components/Toast";
import { isPushSupported, getPermission, getSubscription, subscribe, unsubscribe, sendTestNotification } from "../utils/push";

// ========== Status action buttons ==========
const STATUS_ACTIONS = {
  pending: [
    { label: "Preparing", next: "preparing", style: "bg-accent/15 text-accent hover:bg-accent/25" },
    { label: "Cancel", next: "cancelled", style: "bg-danger/15 text-danger hover:bg-danger/25", confirm: true },
  ],
  preparing: [
    { label: "Served", next: "served", style: "bg-success/15 text-success hover:bg-success/25" },
    { label: "Cancel", next: "cancelled", style: "bg-danger/15 text-danger hover:bg-danger/25", confirm: true },
  ],
  served: [],
  cancelled: [],
};

// "Test User" → "TU"
function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
}

function OrderCard({ order, onStatusChange }) {
  const [busy, setBusy] = useState(false);
  const actions = STATUS_ACTIONS[String(order.status).toLowerCase()] || [];

  const time = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const optText = order.options ? Object.values(order.options).join(", ") : "";

  const handleAction = async (action) => {
    if (action.confirm) {
      const ok = await popupConfirm(
        "Cancel this order?",
        `${order.itemName} × ${order.quantity} — ${order.user.fullName}`,
        "Yes, cancel"
      );
      if (!ok) return;
    }
    setBusy(true);
    try {
      await onStatusChange(order.id, action.next);
    } catch (e) {
      popupError("Could not update", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-border bg-surface p-4 shadow-card"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/15 text-sm font-bold text-accent">
          {initialsOf(order.user.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold">{order.user.fullName}</span>
            <span className="text-xs text-muted">{order.user.employeeId}</span>
            <span className="text-xs text-muted">· {time}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">
              {order.itemName} <span className="text-muted">× {order.quantity}</span>
            </span>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-muted">
            {optText}{optText && " · "}{order.location}
            {order.note && ` · "${order.note}"`}
          </p>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="mt-3 flex gap-2">
          {actions.map((a) => (
            <button
              key={a.next}
              type="button"
              disabled={busy}
              onClick={() => handleAction(a)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${a.style} disabled:opacity-50`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </motion.article>
  );
}

// ========== Filter bar ==========
function FilterBar({ status, setStatus, date, setDate }) {
  const statuses = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "preparing", label: "Preparing" },
    { value: "served", label: "Served" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Filter className="size-4 text-muted" aria-hidden />
        <div className="flex gap-1">
          {statuses.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatus(s.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                status === s.value
                  ? "bg-accent text-accent-fg"
                  : "bg-surface-2 text-muted hover:text-fg"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Calendar className="size-4 text-muted" aria-hidden />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-8 rounded-xl border border-border bg-transparent px-2 text-xs outline-none focus:ring-2 focus:ring-accent/40"
        />
        {date && (
          <button
            type="button"
            onClick={() => setDate("")}
            className="text-xs text-muted hover:text-fg"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ========== Skeleton ==========
function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-surface-2/60" />
      ))}
    </div>
  );
}

// ========== Main Page ==========
export default function AdminSnacks() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [toasts, setToasts] = useState([]);
  const { refresh: refreshBadge } = useSnackOrders();
  const toastIdRef = useRef(0);

  // Push notification state; it turns itself on for admins
  const [pushState, setPushState] = useState("loading"); // loading | unsupported | off | on | denied
  useEffect(() => {
    if (!isPushSupported()) { setPushState("unsupported"); return; }
    if (getPermission() === "denied") { setPushState("denied"); return; }

    // SnackOrderContext subscribes on login,
    // so this only reflects the current state
    if (isPushOptedOut()) { setPushState("off"); return; }
    getSubscription()
      .then((sub) => setPushState(sub ? "on" : "off"))
      .catch(() => setPushState("off"));
  }, []);

  const handlePushToggle = async () => {
    if (pushState === "on") {
      await unsubscribe();
      setPushOptOut(true);
      setPushState("off");
      addToast("Notifications disabled");
    } else {
      try {
        await subscribe();
        setPushOptOut(false);
        setPushState("on");
        addToast("Notifications enabled!");
        sendTestNotification();
      } catch {
        if (getPermission() === "denied") setPushState("denied");
      }
    }
  };

  const addToast = (message, type = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type, duration: 3000 }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const load = useCallback(async () => {
    try {
      const list = await getAdminOrders();
      setOrders(list);
      setError("");
    } catch {
      setError("Could not load orders. Please try again.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll every 10 seconds
  useEffect(() => {
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus.toUpperCase());
    addToast(`Order marked as ${newStatus}`);
    await load();
    refreshBadge();
  };

  const visible = (orders || []).filter((o) => {
    if (status !== "all" && o.status.toLowerCase() !== status) return false;
    if (date && todayYmd(Date.parse(o.createdAt)) !== date) return false;
    return true;
  });

  const orderCount = visible.length;
  const pendingCount = orders?.filter((o) => o.status === "PENDING").length || 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Snack Orders</h1>
          <p className="mt-1 text-sm text-muted">
            Live list of tea and coffee orders.
            {pendingCount > 0 && (
              <span className="ml-2 font-semibold text-warning">{pendingCount} pending</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Push notification toggle */}
          {pushState !== "unsupported" && pushState !== "loading" && (
            <button
              type="button"
              onClick={handlePushToggle}
              disabled={pushState === "denied"}
              title={
                pushState === "denied"
                  ? "Notifications blocked by browser"
                  : pushState === "on"
                  ? "Disable notifications"
                  : "Enable notifications"
              }
              className={`flex h-10 items-center gap-1.5 rounded-2xl border px-3 text-xs font-medium transition disabled:opacity-40 ${
                pushState === "on"
                  ? "border-success/40 text-success hover:bg-success/10"
                  : "border-border text-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              {pushState === "on" ? <Bell className="size-4" /> : <BellOff className="size-4" />}
              {pushState === "on" ? "On" : pushState === "denied" ? "Blocked" : "Notify"}
            </button>
          )}
          <button
            type="button"
            onClick={load}
            className="grid size-10 place-items-center rounded-2xl border border-border text-muted transition hover:bg-surface-2 hover:text-fg"
            aria-label="Refresh"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <FilterBar status={status} setStatus={setStatus} date={date} setDate={setDate} />
      </div>

      <div className="mt-5">
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
        ) : !orders ? (
          <Skeleton />
        ) : orderCount === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-accent/15 text-accent">
              <Coffee className="size-8" />
            </div>
            <p className="font-semibold">No orders found</p>
            <p className="mt-1 text-sm text-muted">
              {status !== "all" || date ? "Try changing the filters." : "Orders will appear here when employees place them."}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {visible.map((o) => (
                <OrderCard key={o.id} order={o} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
