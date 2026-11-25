import { useCallback, useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { getWeek, checkin, cancelCheckin } from "../api/lunchApi";
import { popupError, popupQuick } from "../utils/popup";

function Skeleton() {
  return (
    <div className="h-72 animate-pulse rounded-3xl border border-border bg-surface-2/60" />
  );
}

export default function Lunch() {
  const [menu, setMenu] = useState(undefined);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isCheckedIn = !!menu?.myCheckin;

  const load = useCallback(async () => {
    try {
      const res = await getWeek();
      setMenu(res.data);
      setMessage(res.message);
      setError("");
    } catch {
      setError("Could not load the lunch menu. Please try again.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleCheckin = async (dishId) => {
    setBusy(true);
    try {
      await checkin(menu.id, dishId);
      await popupQuick("Checked in! You will have lunch tomorrow.");
      await load();
    } catch (e) {
      popupError("Could not check in", e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCheckout = async () => {
    if (!isCheckedIn) {
      await popupQuick("You are not checked in yet.");
      return;
    }
    setBusy(true);
    try {
      await cancelCheckin(menu.id);
      await popupQuick("Checked out. You won't have lunch tomorrow.");
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
        Will you have lunch tomorrow? Check-in closes at 10:00 PM.
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
                  ✓ You are checked in — {menu.myCheckin.dishName}
                </p>
              </div>
            )}

            {!isCheckedIn && menu.dishes.length > 0 && (
              <>
                <p className="mt-4 mb-2 text-xs font-medium text-muted">Tomorrow&apos;s menu:</p>
                <div className="space-y-2">
                  {menu.dishes.map((dish) => (
                    <div key={dish.id} className="rounded-2xl border border-border px-4 py-3">
                      <p className="font-medium">{dish.name}</p>
                      {dish.description && <p className="text-xs text-muted">{dish.description}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => handleCheckin(menu.dishes[0]?.id)}
                disabled={busy}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.98] disabled:opacity-50 ${
                  isCheckedIn
                    ? "border-2 border-success bg-success/15 text-success"
                    : "bg-linear-to-r from-accent to-accent-hover text-accent-fg shadow-lg shadow-accent/30 hover:-translate-y-0.5"
                }`}
              >
                <LogIn className="size-5" />
                {isCheckedIn ? "Checked In ✓" : "Check In"}
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={busy}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.98] disabled:opacity-50 ${
                  isCheckedIn
                    ? "border-2 border-danger bg-danger/10 text-danger hover:bg-danger/20"
                    : "border-2 border-border text-muted hover:bg-surface-2"
                }`}
              >
                <LogOut className="size-5" />
                {!isCheckedIn ? "Check Out" : "Checked Out ✗"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
