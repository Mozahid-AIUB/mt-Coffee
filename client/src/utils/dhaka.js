// সব সময় ঢাকার সময় (UTC+6) ধরে হিসাব। বাংলাদেশে daylight saving নেই।
const OFFSET = 6 * 60 * 60 * 1000;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// "YYYY-MM-DD" বানায় (shift করা তারিখ থেকে)
const ymd = (d) => d.toISOString().slice(0, 10);

export const todayYmd = (now = Date.now()) => ymd(new Date(now + OFFSET));

// এই সপ্তাহের রবি থেকে বৃহস্পতি। শুক্র/শনিবারে আসছে সপ্তাহ দেখায়।
export function weekDates(now = Date.now()) {
  const t = new Date(now + OFFSET);
  const dow = t.getUTCDay(); // 0 = রবিবার
  const start = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()));
  if (dow >= 5) start.setUTCDate(start.getUTCDate() + (7 - dow));
  else start.setUTCDate(start.getUTCDate() - dow);
  return [0, 1, 2, 3, 4].map((i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    return ymd(d);
  });
}

export const dayNameOf = (date) => DAY_NAMES[new Date(date + "T00:00:00Z").getUTCDay()];

// লাঞ্চের আগের দিন রাত ১০টা (ঢাকা) = check-in বন্ধের সময়
export function cutoffMs(date) {
  const prev = new Date(date + "T00:00:00Z");
  prev.setUTCDate(prev.getUTCDate() - 1);
  return Date.parse(`${ymd(prev)}T22:00:00+06:00`);
}

export const formatDate = (date) =>
  new Date(date + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

export function formatCountdown(ms) {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
