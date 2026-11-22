import { useCallback, useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { getWeek, checkin, cancelCheckin } from "../api/lunchApi";
import { popupConfirm, popupError, popupQuick } from "../utils/popup";

function Skeleton() {
  return (
    <div className="h-72 animate-pulse rounded-3xl border border-border bg-surface-2/60" />
  );
}

export default function Lunch() {
  const [menu, setMenu] = useState(undefined);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedDish, setSelectedDish] = useState(null);
  const [busy, setBusy] = useState(false);

  const isCheckedIn = !!menu?.myCheckin;

  const load = useCallback(async () => {
    try {
      const res = await getWeek();
      setMenu(res.data);
      setMessage(res.message);
      setError("");
      if (res.data?.myCheckin) {
        setSelectedDish(res.data.myCheckin.dishId);
      } else {
        setSelectedDish(null);
      }
    } catch {
      setError("Could not load the lunch menu. Please try again.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleCheckin = async () => {
    if (!selectedDish) {
      popupError("Select a dish", "Please select a dish before checking in.");
      return;
    }
    setBusy(true);
    try {
      await checkin(menu.id, selectedDish);
      await popupQuick("Checked in for tomorrow's lunch!");
      await load();
    } catch (e) {
      popupError("Could not check in", e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCheckout = async () => {
    const ok = await popupConfirm("Check out?", "You won't have lunch tomorrow. You can check in again later.", "Yes, check out");
    if (!ok) return;
    setBusy(true);
    try {
      await cancelCheckin(menu.id);
      await popupQuick("Checked out — you won't have lunch tomorrow");
      await load();
    } catch (e) {
      popupError("Could not check out", e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Lunch</h1>
      <p className="mt-1 text-sm text-muted">
        Choose one dish for tomorrow. Check-in closes at 10:00 PM.
      </p>

      <div className="mt-6">
        {error ? (
          <div className="rounded-3xl border border-danger/40 bg-danger/10 p-6 text-center">
            <p className="text-sm text-danger">{error}</p>
            <button type="button" onClick={load} className="mt-3 h-10 rounded-xl bg-accent px-5 text-sm font-medium text-accent-fg">
              Try again
            </button>
          </div>
        ) : menu === undefined ? (
          <Skeleton />
        ) : menu === null ? (
          <div className="rounded-3xl border border-border bg-surface p-8 text-center">
            <p className="text-muted">{message}</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">{new Date(menu.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h2>

            {isCheckedIn && (
              <div className="mt-3 rounded-2xl bg-success/15 px-4 py-2.5">
                <p className="text-sm font-medium text-success">
                  You are checked in for tomorrow&apos;s lunch.
                </p>
              </div>
            )}

            <p className="mt-4 mb-2 text-xs font-medium text-muted">
              {isCheckedIn ? "Your selected dish:" : "Select a dish:"}
            </p>
            <div className="space-y-3">
              {menu.dishes.map((dish) => {
                const isSelected = selectedDish === dish.id;
                return (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => !isCheckedIn && setSelectedDish(dish.id)}
                    disabled={isCheckedIn}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-accent bg-accent/10"
                        : "border-border hover:bg-surface-2"
                    } disabled:cursor-default disabled:opacity-70`}
                  >
                    <div className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                      isSelected ? "border-accent bg-accent" : "border-border"
                    }`}>
                      {isSelected && <div className="size-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{dish.name}</p>
                      {dish.description && <p className="text-xs text-muted">{dish.description}</p>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex gap-3">
              {!isCheckedIn ? (
                <button
                  type="button"
                  onClick={handleCheckin}
                  disabled={busy || !selectedDish}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-accent to-accent-hover font-semibold text-accent-fg shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <LogIn className="size-5" />
                  Check In
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={busy}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-danger font-semibold text-danger transition hover:bg-danger/10 active:scale-[0.98] disabled:opacity-50"
                >
                  <LogOut className="size-5" />
                  Check Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
