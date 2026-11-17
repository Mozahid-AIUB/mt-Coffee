import { useState } from "react";
import { CheckCircle2, Clock, Lock, CalendarOff } from "lucide-react";
import Button from "./Button";
import { formatCountdown, formatDate } from "../utils/dhaka";
import { popupConfirm, popupError, popupQuick } from "../utils/popup";

export default function LunchDayCard({ day, now, isToday, onCheckin, onCancel }) {
  const [selected, setSelected] = useState(day.myDishId);
  const [busy, setBusy] = useState(false);

  const hasMenu = !!day.menuId;
  const isOpen = hasMenu && now < day.closesAt;
  const myDish = day.dishes.find((d) => d.id === day.myDishId);
  const changed = selected !== day.myDishId;

  const handleCheckin = async () => {
    const dish = day.dishes.find((d) => d.id === selected);
    const ok = await popupConfirm(
      myDish ? "Change your lunch?" : "Confirm check-in?",
      `${dish.name} on ${day.dayName}`,
      myDish ? "Yes, change" : "Yes, check in"
    );
    if (!ok) return;
    setBusy(true);
    try {
      await onCheckin(day.menuId, selected);
      popupQuick("Saved");
    } catch (e) {
      popupError("Could not save", e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    const ok = await popupConfirm("Cancel check-in?", `${day.dayName}: ${myDish.name}`, "Yes, cancel");
    if (!ok) return;
    setBusy(true);
    try {
      await onCancel(day.menuId);
      setSelected(null);
      popupQuick("Check-in cancelled");
    } catch (e) {
      popupError("Could not cancel", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      className={`rounded-3xl border bg-surface p-5 shadow-card transition ${
        isToday ? "border-accent" : "border-border"
      }`}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold leading-tight">{day.dayName}</h2>
          <p className="text-sm text-muted">
            {formatDate(day.date)}
            {isToday && <span className="ml-2 font-medium text-accent">Today</span>}
          </p>
        </div>

        {!hasMenu ? (
          <span className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
            <CalendarOff className="size-3.5" aria-hidden /> No menu
          </span>
        ) : isOpen ? (
          <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
            <Clock className="size-3.5" aria-hidden /> Closes in {formatCountdown(day.closesAt - now)}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
            <Lock className="size-3.5" aria-hidden /> Closed
          </span>
        )}
      </header>

      {!hasMenu ? (
        <p className="rounded-2xl bg-surface-2 px-4 py-6 text-center text-sm text-muted">
          The menu has not been published yet.
        </p>
      ) : (
        <>
          <div className="space-y-2" role="radiogroup" aria-label={`${day.dayName} dishes`}>
            {day.dishes.map((dish) => {
              const active = selected === dish.id;
              return (
                <label
                  key={dish.id}
                  className={`flex items-start gap-3 rounded-2xl border p-3 transition ${
                    active ? "border-accent bg-accent/10" : "border-border"
                  } ${isOpen ? "cursor-pointer hover:bg-surface-2" : "cursor-not-allowed opacity-70"}`}
                >
                  <input
                    type="radio"
                    name={day.menuId}
                    value={dish.id}
                    checked={active}
                    disabled={!isOpen || busy}
                    onChange={() => setSelected(dish.id)}
                    className="mt-1 size-4 accent-accent"
                  />
                  <span>
                    <span className="block text-sm font-medium">{dish.name}</span>
                    {dish.description && (
                      <span className="block text-xs text-muted">{dish.description}</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>

          {isOpen ? (
            <div className="mt-4 space-y-2">
              <Button
                type="button"
                loading={busy}
                disabled={busy || !selected || (!!myDish && !changed)}
                onClick={handleCheckin}
              >
                {myDish ? (changed ? "Change my choice" : "Checked in") : "Check in"}
              </Button>
              {myDish && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCancel}
                  className="h-10 w-full rounded-xl text-sm font-medium text-danger transition hover:bg-danger/10 disabled:opacity-60"
                >
                  Cancel check-in
                </button>
              )}
            </div>
          ) : (
            <p className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-sm">
              {myDish ? (
                <>
                  <CheckCircle2 className="size-4 text-success" aria-hidden />
                  You chose: <span className="font-semibold">{myDish.name}</span>
                </>
              ) : (
                <span className="text-muted">You did not check in for this day.</span>
              )}
            </p>
          )}
        </>
      )}
    </article>
  );
}
