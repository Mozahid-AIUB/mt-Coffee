import { useState } from "react";
import { Coffee, CupSoda, Send, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { popupError, popupQuick } from "../utils/popup";

// Pick the icon from the item name, since the database id is a UUID
function ItemIcon({ name = "", ...props }) {
  return /tea/i.test(name) ? <CupSoda {...props} /> : <Coffee {...props} />;
}

// Choice buttons for one option group
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

// The API sometimes sends options as an object ({sugar: [...]}), so normalise to an array
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

// One snack item card (tea or coffee)
export default function SnackItemCard({ item, isOpen, onOrder }) {
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
      // Reset the form
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
          <ItemIcon name={item.name} className="size-6" aria-hidden />
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
