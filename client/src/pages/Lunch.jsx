import { useCallback, useEffect, useState } from "react";
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
    try {
      await checkin(menu.id, dishId);
      await popupQuick("Checked in!");
      await load();
    } catch (e) {
      popupError("Could not check in", e.response?.data?.message || e.message);
    }
  };

  const handleCancel = async () => {
    const ok = await popupConfirm("Cancel check-in?", "You can check in again later.", "Yes, cancel");
    if (!ok) return;
    try {
      await cancelCheckin(menu.id);
      await popupQuick("Check-in cancelled");
      await load();
    } catch (e) {
      popupError("Could not cancel", e.response?.data?.message || e.message);
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
            <div className="mt-4 space-y-3">
              {menu.dishes.map((dish) => (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => handleCheckin(dish.id)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-border p-4 text-left transition hover:bg-surface-2"
                >
                  <div className="flex-1">
                    <p className="font-medium">{dish.name}</p>
                    <p className="text-xs text-muted">{dish.description}</p>
                  </div>
                </button>
              ))}
            </div>
            {menu.myCheckin && (
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-success/15 px-4 py-3">
                <p className="text-sm font-medium text-success">Checked in!</p>
                <button type="button" onClick={handleCancel} className="text-xs font-medium text-danger hover:underline">
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
