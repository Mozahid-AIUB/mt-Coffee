// Every date here is Dhaka time (UTC+6). Bangladesh has no daylight saving.
const OFFSET = 6 * 60 * 60 * 1000;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Formats an already-shifted date as "YYYY-MM-DD"
const ymd = (d) => d.toISOString().slice(0, 10);

// The API sends either "2026-11-26" or a full ISO timestamp, so accept both
export const toYmd = (date) => String(date ?? "").slice(0, 10);

export const todayYmd = (now = Date.now()) => ymd(new Date(now + OFFSET));

// Sunday to Thursday of this week. On Friday and Saturday, shows the coming week.
export function weekDates(now = Date.now()) {
  const t = new Date(now + OFFSET);
  const dow = t.getUTCDay(); // 0 = Sunday
  const start = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()));
  if (dow >= 5) start.setUTCDate(start.getUTCDate() + (7 - dow));
  else start.setUTCDate(start.getUTCDate() - dow);
  return [0, 1, 2, 3, 4].map((i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    return ymd(d);
  });
}

export const dayNameOf = (date) => DAY_NAMES[new Date(toYmd(date) + "T00:00:00Z").getUTCDay()];

// Check-in closes at 10pm Dhaka time the night before
export function cutoffMs(date) {
  const prev = new Date(date + "T00:00:00Z");
  prev.setUTCDate(prev.getUTCDate() - 1);
  return Date.parse(`${ymd(prev)}T22:00:00+06:00`);
}

export const formatDate = (date) =>
  new Date(toYmd(date) + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

// Whether snack service is open (8am to 8pm Dhaka time)
export function snackServiceOpen(now = Date.now()) {
  const t = new Date(now + OFFSET);
  const h = t.getUTCHours();
  return h >= 8 && h < 20;
}

// Milliseconds until service next opens or closes
export function nextSnackBoundary(now = Date.now()) {
  const t = new Date(now + OFFSET);
  const h = t.getUTCHours();
  const m = t.getUTCMinutes();
  const s = t.getUTCSeconds();
  const ms = t.getUTCMilliseconds();
  const currentMs = ((h * 60 + m) * 60 + s) * 1000 + ms;
  const isOpen = h >= 8 && h < 20;
  // 8am = 8*3600*1000, 8pm = 20*3600*1000
  const targetMs = isOpen ? 20 * 3600000 : (h < 8 ? 8 * 3600000 : 24 * 3600000 + 8 * 3600000);
  return targetMs - currentMs;
}

export function formatClock(now = Date.now()) {
  const t = new Date(now + OFFSET);
  const h = t.getUTCHours();
  const m = t.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatCountdown(ms) {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
