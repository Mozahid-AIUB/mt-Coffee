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

// স্ন্যাকস সার্ভিস চালু আছে কি না (সকাল ৮টা - রাত ৮টা ঢাকা সময়)
export function snackServiceOpen(now = Date.now()) {
  const t = new Date(now + OFFSET);
  const h = t.getUTCHours();
  return h >= 8 && h < 20;
}

// পরের opening/closing সময় পর্যন্ত কত মিলিসেকেন্ড বাকি
export function nextSnackBoundary(now = Date.now()) {
  const t = new Date(now + OFFSET);
  const h = t.getUTCHours();
  const m = t.getUTCMinutes();
  const s = t.getUTCSeconds();
  const ms = t.getUTCMilliseconds();
  const currentMs = ((h * 60 + m) * 60 + s) * 1000 + ms;
  const isOpen = h >= 8 && h < 20;
  // ৮টা = 8*3600*1000, রাত ৮টা = 20*3600*1000
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
