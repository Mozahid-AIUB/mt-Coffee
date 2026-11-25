import { useCallback, useEffect, useState } from "react";
import { Calendar, Users, ChefHat, Download, Search } from "lucide-react";
import { motion } from "motion/react";
import { getReport, exportCSV } from "../api/adminLunchApi";
import { weekDates, dayNameOf, formatDate, todayYmd } from "../utils/dhaka";

// ========== Summary Card ==========
function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className={`grid size-10 place-items-center rounded-xl ${color}`}>
          <Icon className="size-5" aria-hidden />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ========== Bar Chart (plain CSS/SVG, no library) ==========
function DishBarChart({ perDish }) {
  const max = Math.max(...perDish.map((d) => d.count), 1);
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <h3 className="mb-4 text-sm font-semibold">Check-ins per Dish</h3>
      <div className="space-y-3">
        {perDish.map((d) => {
          const pct = Math.round((d.count / max) * 100);
          return (
            <div key={d.dishId}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium">{d.name}</span>
                <span className="text-muted">{d.count}</span>
              </div>
              <div className="h-6 overflow-hidden rounded-lg bg-surface-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-lg bg-linear-to-r from-accent to-accent-hover"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========== Employee Table ==========
function EmployeeTable({ employees, search }) {
  const q = search.toLowerCase();
  const filtered = q
    ? employees.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.dishName.toLowerCase().includes(q)
      )
    : employees;

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        {search ? "No matching employees found." : "No check-ins for this date."}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-2/60 text-left">
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Employee ID</th>
            <th className="px-4 py-3 font-semibold">Dish</th>
            <th className="px-4 py-3 font-semibold">Time</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-surface-2/40 transition">
              <td className="px-4 py-3 font-medium">{e.fullName}</td>
              <td className="px-4 py-3 text-muted">{e.employeeId}</td>
              <td className="px-4 py-3">{e.dishName}</td>
              <td className="px-4 py-3 text-muted">
                {new Date(e.checkedInAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== Skeleton ==========
function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-surface-2/60" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl border border-border bg-surface-2/60" />
    </div>
  );
}

// ========== Main Page ==========
export default function AdminReports() {
  const dates = weekDates();
  const today = todayYmd();
  // Default to today when it is a working day, otherwise the first day of the week
  const defaultDate = dates.includes(today) ? today : dates[0];

  const [date, setDate] = useState(defaultDate);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    if (!date) return;
    setReport(null);
    try {
      const r = await getReport(date);
      setReport(r);
      setError("");
    } catch {
      setError("Could not load report. Please try again.");
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await exportCSV(date);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lunch-report-${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lunch Report</h1>
          <p className="mt-1 text-sm text-muted">
            See who chose what, with totals and CSV export.
          </p>
        </div>
        {report && report.total > 0 && (
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex h-10 items-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium transition hover:bg-surface-2 disabled:opacity-50"
          >
            <Download className="size-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Date picker, with this week's days as quick buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Calendar className="size-4 text-muted" aria-hidden />
        {dates.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDate(d)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              date === d
                ? "bg-accent text-accent-fg"
                : "bg-surface-2 text-muted hover:text-fg"
            }`}
          >
            {dayNameOf(d)} {formatDate(d)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {error ? (
          <div className="rounded-3xl border border-danger/40 bg-danger/10 p-6 text-center">
            <p className="text-sm text-danger">{error}</p>
            <button type="button" onClick={load} className="mt-3 h-10 rounded-xl bg-accent px-5 text-sm font-medium text-accent-fg">
              Try again
            </button>
          </div>
        ) : !report ? (
          <Skeleton />
        ) : report.total === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-accent/15 text-accent">
              <ChefHat className="size-8" />
            </div>
            <p className="font-semibold">No check-ins yet</p>
            <p className="mt-1 text-sm text-muted">
              {dayNameOf(date)}, {formatDate(date)} — no employees have checked in.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <SummaryCard icon={Users} label="Total check-ins" value={report.total} color="bg-accent/15 text-accent" />
              <SummaryCard icon={ChefHat} label="Dishes available" value={report.perDish.length} color="bg-success/15 text-success" />
            </div>

            {/* Bar chart */}
            <DishBarChart perDish={report.perDish} />

            {/* Employee table */}
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">Employee Check-ins</h3>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, ID or dish..."
                    className="h-9 w-56 rounded-xl border border-border bg-transparent pl-9 pr-3 text-xs outline-none transition placeholder:text-muted/50 focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              </div>
              <EmployeeTable employees={report.employees} search={search} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
