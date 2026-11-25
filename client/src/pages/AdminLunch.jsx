import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Save, Edit3, X, Calendar, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getMenus, createMenu, updateMenu, deleteMenu } from "../api/adminLunchApi";
import { weekDates, dayNameOf, formatDate, toYmd, cutoffMs, formatCountdown } from "../utils/dhaka";
import { useNow } from "../hooks/useNow";
import { popupConfirm, popupError, popupQuick, popupSuccess } from "../utils/popup";

// ========== Dish Input Row ==========
function DishRow({ dish, index, onChange, onRemove, disabled }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1 space-y-1.5">
        <input
          type="text"
          value={dish.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
          disabled={disabled}
          placeholder="Dish name"
          className={`h-9 w-full rounded-xl border bg-transparent px-3 text-sm outline-none transition placeholder:text-muted/50 focus:ring-2 focus:ring-accent/40 ${
            dish._errName ? "border-danger" : "border-border"
          }`}
        />
        {dish._errName && <p className="text-xs text-danger">{dish._errName}</p>}
        <input
          type="text"
          value={dish.description}
          onChange={(e) => onChange(index, "description", e.target.value)}
          disabled={disabled}
          placeholder="Short description (optional)"
          className="h-9 w-full rounded-xl border border-border bg-transparent px-3 text-sm outline-none transition placeholder:text-muted/50 focus:ring-2 focus:ring-accent/40"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={disabled}
        className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl text-danger transition hover:bg-danger/10 disabled:opacity-50"
        aria-label="Remove dish"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

// ========== Menu Form (create / edit) ==========
function MenuForm({ editMenu, onSave, onCancel }) {
  const [date, setDate] = useState(toYmd(editMenu?.date) || "");
  const [dishes, setDishes] = useState(
    editMenu?.dishes?.map((d) => ({ ...d, _errName: "" })) || [
      { id: "", name: "", description: "", _errName: "" },
    ]
  );
  const [busy, setBusy] = useState(false);
  const [dateErr, setDateErr] = useState("");

  const isEdit = !!editMenu;

  const changeDish = (i, field, val) => {
    setDishes((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: val, _errName: field === "name" ? "" : copy[i]._errName };
      return copy;
    });
  };

  const removeDish = (i) => {
    if (dishes.length <= 1) return;
    setDishes((prev) => prev.filter((_, n) => n !== i));
  };

  const addDish = () => {
    setDishes((prev) => [...prev, { id: "", name: "", description: "", _errName: "" }]);
  };

  const validate = () => {
    let ok = true;
    if (!isEdit && !date) {
      setDateErr("Pick a date");
      ok = false;
    } else if (!isEdit) {
      const dow = new Date(date + "T00:00:00Z").getUTCDay();
      if (dow === 5 || dow === 6) {
        setDateErr("Lunch is only available Sunday to Thursday");
        ok = false;
      } else {
        setDateErr("");
      }
    }
    const names = new Set();
    const updated = dishes.map((d) => {
      let err = "";
      if (!d.name.trim()) err = "Dish name is required";
      else if (names.has(d.name.trim().toLowerCase())) err = "This dish already exists";
      names.add(d.name.trim().toLowerCase());
      if (err) ok = false;
      return { ...d, _errName: err };
    });
    setDishes(updated);
    return ok;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      // ব্যাকএন্ড শুধু name/description নেয়, তাই id বাদ
      const cleanDishes = dishes.map((d) => ({
        name: d.name.trim(),
        description: (d.description || "").trim() || undefined,
      }));
      if (isEdit) {
        await onSave(editMenu.id, cleanDishes);
        popupQuick("Menu updated");
      } else {
        await onSave(date, cleanDishes);
        popupSuccess("Menu saved", `${dayNameOf(date)}, ${formatDate(date)}`);
      }
    } catch (e) {
      popupError("Could not save", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-accent/40 bg-surface p-5 shadow-card"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">{isEdit ? `Edit: ${dayNameOf(editMenu.date)}, ${formatDate(editMenu.date)}` : "New Menu"}</h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="grid size-8 place-items-center rounded-xl text-muted hover:bg-surface-2">
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* তারিখ বাছাই (শুধু create-এ) */}
      {!isEdit && (
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-muted" htmlFor="menu-date">
            Date (Sunday – Thursday only)
          </label>
          <input
            id="menu-date"
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setDateErr(""); }}
            disabled={busy}
            className={`h-10 w-full rounded-xl border bg-transparent px-3 text-sm outline-none transition focus:ring-2 focus:ring-accent/40 ${
              dateErr ? "border-danger" : "border-border"
            }`}
          />
          {dateErr && <p className="mt-1 text-xs text-danger">{dateErr}</p>}
        </div>
      )}

      {/* Dish তালিকা */}
      <div className="space-y-3">
        {dishes.map((d, i) => (
          <DishRow key={i} dish={d} index={i} onChange={changeDish} onRemove={removeDish} disabled={busy} />
        ))}
      </div>
      <button
        type="button"
        onClick={addDish}
        disabled={busy}
        className="mt-3 flex h-9 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-xs font-medium text-muted transition hover:bg-surface-2 disabled:opacity-50"
      >
        <Plus className="size-3.5" /> Add dish
      </button>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={busy}
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-accent to-accent-hover font-semibold text-accent-fg shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70"
      >
        {busy ? (
          <span className="size-5 animate-spin rounded-full border-2 border-accent-fg/30 border-t-accent-fg" />
        ) : (
          <Save className="size-4" />
        )}
        {isEdit ? "Update Menu" : "Save Menu"}
      </button>
    </motion.div>
  );
}

// ========== Menu Card (existing menu) ==========
function MenuCard({ menu, now, onEdit, onDelete }) {
  const [busy, setBusy] = useState(false);
  const isClosed = now >= menu.cutoffAt;
  const totalCheckins = menu.dishes.reduce((n, d) => n + (d.checkinCount || 0), 0);

  const handleDelete = async () => {
    const ok = await popupConfirm(
      "Delete this menu?",
      totalCheckins > 0
        ? `${totalCheckins} employee(s) already checked in — their choices will be lost.`
        : `${dayNameOf(menu.date)}, ${formatDate(menu.date)}`,
      "Yes, delete"
    );
    if (!ok) return;
    setBusy(true);
    try {
      await onDelete(menu.id);
      popupQuick("Menu deleted");
    } catch (e) {
      popupError("Could not delete", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{dayNameOf(menu.date)}</h3>
          <p className="text-sm text-muted">{formatDate(menu.date)}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {isClosed ? (
            <span className="rounded-full bg-surface-2 px-2.5 py-1 font-medium text-muted">Closed</span>
          ) : (
            <span className="rounded-full bg-success/15 px-2.5 py-1 font-medium text-success">
              Closes in {formatCountdown(menu.cutoffAt - now)}
            </span>
          )}
        </div>
      </header>

      <ul className="space-y-1.5">
        {menu.dishes.map((d) => (
          <li key={d.id} className="flex items-center justify-between rounded-xl bg-surface-2/60 px-3 py-2 text-sm">
            <div>
              <span className="font-medium">{d.name}</span>
              {d.description && <span className="ml-2 text-xs text-muted">{d.description}</span>}
            </div>
            {d.checkinCount > 0 && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                {d.checkinCount}
              </span>
            )}
          </li>
        ))}
      </ul>

      {totalCheckins > 0 && (
        <p className="mt-2 text-xs text-muted">{totalCheckins} check-in(s) total</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(menu)}
          disabled={busy}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-medium transition hover:bg-surface-2 disabled:opacity-50"
        >
          <Edit3 className="size-3.5" /> Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-danger/40 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:opacity-50"
        >
          <Trash2 className="size-3.5" /> Delete
        </button>
      </div>
    </article>
  );
}

// ========== Skeleton ==========
function Skeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 animate-pulse rounded-3xl border border-border bg-surface-2/60" />
      ))}
    </div>
  );
}

// ========== Main Page ==========
export default function AdminLunch() {
  const [menus, setMenus] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const tick = useNow(30000);

  const dates = weekDates();

  const load = useCallback(async () => {
    try {
      const list = await getMenus(dates[0], dates[4]);
      setMenus(list);
      setError("");
    } catch {
      setError("Could not load menus. Please try again.");
    }
  }, [dates[0], dates[4]]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (date, dishes) => {
    await createMenu(date, dishes);
    setShowForm(false);
    await load();
  };

  const handleUpdate = async (menuId, dishes) => {
    await updateMenu(menuId, dishes);
    setEditTarget(null);
    await load();
  };

  const handleDelete = async (menuId) => {
    await deleteMenu(menuId);
    await load();
  };

  const handleEdit = (menu) => {
    setEditTarget(menu);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lunch Menu Management</h1>
          <p className="mt-1 text-sm text-muted">
            Create and edit the lunch menu for each day.
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Week of {formatDate(dates[0])} to {formatDate(dates[4])}
          </p>
        </div>
        {!showForm && !editTarget && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex h-10 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-fg shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Plus className="size-4" /> New Menu
          </button>
        )}
      </div>

      {/* Form area */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {editTarget && (
            <MenuForm
              key={`edit-${editTarget.id}`}
              editMenu={editTarget}
              onSave={handleUpdate}
              onCancel={() => setEditTarget(null)}
            />
          )}
          {showForm && !editTarget && (
            <MenuForm
              key="create"
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* মেনু তালিকা */}
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
        ) : !menus ? (
          <Skeleton />
        ) : menus.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-accent/15 text-accent">
              <ChefHat className="size-8" />
            </div>
            <p className="font-semibold">No menus this week</p>
            <p className="mt-1 text-sm text-muted">Click "New Menu" to add the first one.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {menus.map((m) => (
              <MenuCard key={m.id} menu={m} now={tick} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
