import { useCallback, useEffect, useState } from "react";
import { Coffee, CupSoda, Clock, Send, X, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getItems, placeOrder, getMyOrders, cancelOrder } from "../api/snacksApi";
import { snackServiceOpen, formatClock } from "../utils/dhaka";
import { useNow } from "../hooks/useNow";
import { popupConfirm, popupError, popupQuick } from "../utils/popup";
import StatusBadge from "../components/StatusBadge";

const ITEM_ICONS = { tea: CupSoda, coffee: Coffee };

// একটা আইটেমের option বাছাই
function OptionPicker({ opt, value, onChange, disabled }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted">{opt.label}</p>
      <div className="flex flex-wrap gap-1.5">
        {opt.choices.map((c) => (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.key, c)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              value === c
                ? "border-accent bg-accent/15 text-accent"
                : "border-border text-muted hover:bg-surface-2"
            } disabled:opacity-60`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

// Quantity selector
function QuantityControl({ qty, setQty, disabled }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled || qty <= 1}
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className="grid size-8 place-items-center rounded-xl border border-border text-muted transition hover:bg-surface-2 disabled:opacity-40"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-semibold">{qty}</span>
      <button
        type="button"
        disabled={disabled || qty >= 5}
        onClick={() => setQty((q) => Math.min(5, q + 1))}
        className="grid size-8 place-items-center rounded-xl border border-border text-muted transition hover:bg-surface-2 disabled:opacity-40"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

function normalizeOptions(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return Object.entries(raw).map(([key, choices]) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    choices,
    default: choices[0],
  }));
}

// একটা Snack Item কার্ড (Tea / Coffee)
function ItemCard({ item, isOpen, onOrder }) {
  const Icon = ITEM_ICONS[item.id] || Coffee;
  const options = normalizeOptions(item.options);
  const [expanded, setExpanded] = useState(false);
  const [opts, setOpts] = useState(() => {
    const d = {};
    options.forEach((o) => {
      d[o.key] = o.default;
    });
    return d;
  });
  const [qty, setQty] = useState(1);
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const changeOpt = (key, val) => setOpts((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    const e = {};
    if (qty < 1 || qty > 5) e.qty = "Quantity must be between 1 and 5";
    if (!location.trim()) e.location = "Please enter your desk or room";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOrder = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      await onOrder({ itemId: item.id, quantity: qty, options: opts, location: location.trim(), note: note.trim() });
      popupQuick(`${item.name} ordered!`);
      // রিসেট
      setQty(1);
      setLocation("");
      setNote("");
      setErrors({});
      setExpanded(false);
    } catch (e) {
      popupError("Could not place order", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-3xl border border-border bg-surface shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => isOpen && setExpanded((v) => !v)}
        disabled={!isOpen}
        className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-surface-2/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent">
          <Icon className="size-6" aria-hidden />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-muted">
            {options.map((o) => o.choices.join(", ")).join(" · ")}
          </p>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-muted"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-border px-5 pb-5 pt-4">
              {/* Options */}
              {options.map((o) => (
                <OptionPicker
                  key={o.key}
                  opt={o}
                  value={opts[o.key]}
                  onChange={changeOpt}
                  disabled={busy}
                />
              ))}

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Quantity (max 5)</span>
                <QuantityControl qty={qty} setQty={setQty} disabled={busy} />
              </div>
              {errors.qty && <p className="text-xs text-danger">{errors.qty}</p>}

              {/* Location */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted" htmlFor={`loc-${item.id}`}>
                  Desk / Room
                </label>
                <input
                  id={`loc-${item.id}`}
                  type="text"
                  maxLength={60}
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (errors.location) setErrors((p) => ({ ...p, location: "" }));
                  }}
                  disabled={busy}
                  placeholder="e.g. 3rd floor, desk 12"
                  className={`h-10 w-full rounded-xl border bg-transparent px-3 text-sm outline-none transition placeholder:text-muted/50 focus:ring-2 focus:ring-accent/40 ${
                    errors.location ? "border-danger" : "border-border"
                  }`}
                />
                {errors.location && <p className="mt-1 text-xs text-danger">{errors.location}</p>}
              </div>

              {/* Note */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted" htmlFor={`note-${item.id}`}>
                  Note (optional)
                </label>
                <input
                  id={`note-${item.id}`}
                  type="text"
                  maxLength={150}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={busy}
                  placeholder="Extra hot, less milk..."
                  className="h-10 w-full rounded-xl border border-border bg-transparent px-3 text-sm outline-none transition placeholder:text-muted/50 focus:ring-2 focus:ring-accent/40"
                />
              </div>

              {/* Order button */}
              <button
                type="button"
                onClick={handleOrder}
                disabled={busy}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-accent to-accent-hover font-semibold text-accent-fg shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] disabled:opacity-70"
              >
                {busy ? (
                  <span className="size-5 animate-spin rounded-full border-2 border-accent-fg/30 border-t-accent-fg" />
                ) : (
                  <Send className="size-4" aria-hidden />
                )}
                Place Order
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

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
      {order.status === "pending" && (
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
              <ItemCard key={item.id} item={item} isOpen={isOpen} onOrder={handleOrder} />
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
