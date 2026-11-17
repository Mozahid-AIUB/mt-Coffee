import { useCallback, useEffect, useState } from "react";
import LunchDayCard from "../components/LunchDayCard";
import { cancelCheckin, checkin, getWeek } from "../api/lunchApi";
import { useNow } from "../hooks/useNow";
import { formatDate, todayYmd } from "../utils/dhaka";

function Skeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-72 animate-pulse rounded-3xl border border-border bg-surface-2/60" />
      ))}
    </div>
  );
}

export default function Lunch() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const tick = useNow(30000);

  const load = useCallback(async () => {
    try {
      const res = await getWeek();
      // server এর ঘড়ি আর এই পিসির ঘড়ির পার্থক্য, countdown ঠিক রাখতে
      setData({ days: res.days, offset: res.serverTime - Date.now() });
      setError("");
    } catch {
      setError("Could not load the lunch menu. Please try again.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCheckin = async (menuId, dishId) => {
    await checkin(menuId, dishId);
    await load();
  };
  const handleCancel = async (menuId) => {
    await cancelCheckin(menuId);
    await load();
  };

  const now = tick + (data?.offset ?? 0);
  const today = todayYmd(now);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Lunch</h1>
      <p className="mt-1 text-sm text-muted">
        Choose one dish per day. Check-in closes at 10:00 PM the day before.
      </p>
      {data && (
        <p className="mt-1 text-xs text-muted">
          Week of {formatDate(data.days[0].date)} to {formatDate(data.days[4].date)}
        </p>
      )}

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
        ) : !data ? (
          <Skeleton />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {data.days.map((day) => (
              <LunchDayCard
                key={day.date}
                day={day}
                now={now}
                isToday={day.date === today}
                onCheckin={handleCheckin}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
