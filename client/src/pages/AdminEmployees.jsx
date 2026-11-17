import { useCallback, useEffect, useState } from "react";
import { Search, Users, Shield, UserCheck, UserX } from "lucide-react";
import { motion } from "motion/react";
import { getUsers, toggleActive } from "../api/adminUsersApi";
import { popupConfirm, popupError, popupQuick } from "../utils/popup";

// ========== Employee Row ==========
function EmployeeRow({ user, onToggle }) {
  const [busy, setBusy] = useState(false);
  const isAdmin = user.role === "admin";

  const handleToggle = async () => {
    const action = user.isActive ? "deactivate" : "activate";
    const ok = await popupConfirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} ${user.fullName}?`,
      user.isActive
        ? "This employee will not be able to log in."
        : "This employee will be able to log in again.",
      `Yes, ${action}`
    );
    if (!ok) return;
    setBusy(true);
    try {
      await onToggle(user.id, !user.isActive);
      popupQuick(`${user.fullName} ${user.isActive ? "deactivated" : "activated"}`);
    } catch (e) {
      popupError("Could not update", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card"
    >
      {/* Avatar */}
      <div
        className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold ${
          isAdmin
            ? "bg-accent text-accent-fg"
            : user.isActive
            ? "bg-success/15 text-success"
            : "bg-surface-2 text-muted"
        }`}
      >
        {user.fullName
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm truncate">{user.fullName}</span>
          {isAdmin && (
            <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
              <Shield className="size-3" /> Admin
            </span>
          )}
          {!isAdmin && !user.isActive && (
            <span className="rounded-full bg-danger/15 px-2 py-0.5 text-xs font-semibold text-danger">
              Inactive
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted truncate">
          {user.employeeId} · {user.email}
        </p>
        <p className="text-xs text-muted">{user.phone}</p>
      </div>

      {/* Toggle */}
      {!isAdmin && (
        <button
          type="button"
          disabled={busy}
          onClick={handleToggle}
          className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition disabled:opacity-50 ${
            user.isActive
              ? "border-danger/40 text-danger hover:bg-danger/10"
              : "border-success/40 text-success hover:bg-success/10"
          }`}
        >
          {user.isActive ? (
            <>
              <UserX className="size-3.5" /> Deactivate
            </>
          ) : (
            <>
              <UserCheck className="size-3.5" /> Activate
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}

// ========== Skeleton ==========
function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-surface-2/60" />
      ))}
    </div>
  );
}

// ========== Main Page ==========
export default function AdminEmployees() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // search debounce — টাইপ করার ৩০০ms পর API call
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    try {
      const list = await getUsers(debouncedSearch || undefined);
      setUsers(list);
      setError("");
    } catch {
      setError("Could not load employees. Please try again.");
    }
  }, [debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (userId, isActive) => {
    await toggleActive(userId, isActive);
    await load();
  };

  const totalActive = users?.filter((u) => u.role !== "admin" && u.isActive).length || 0;
  const totalInactive = users?.filter((u) => u.role !== "admin" && !u.isActive).length || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
      <p className="mt-1 text-sm text-muted">
        Search employees and activate or deactivate accounts.
        {users && (
          <span className="ml-2">
            <span className="text-success font-medium">{totalActive} active</span>
            {totalInactive > 0 && (
              <span className="text-danger font-medium"> · {totalInactive} inactive</span>
            )}
          </span>
        )}
      </p>

      {/* Search bar */}
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ID, email or phone..."
          className="h-11 w-full rounded-2xl border border-border bg-surface pl-11 pr-4 text-sm outline-none transition placeholder:text-muted/50 focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="mt-5">
        {error ? (
          <div className="rounded-3xl border border-danger/40 bg-danger/10 p-6 text-center">
            <p className="text-sm text-danger">{error}</p>
            <button type="button" onClick={load} className="mt-3 h-10 rounded-xl bg-accent px-5 text-sm font-medium text-accent-fg">
              Try again
            </button>
          </div>
        ) : !users ? (
          <Skeleton />
        ) : users.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-accent/15 text-accent">
              <Users className="size-8" />
            </div>
            <p className="font-semibold">No employees found</p>
            <p className="mt-1 text-sm text-muted">
              {search ? "Try a different search term." : "No employees registered yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <EmployeeRow key={u.id} user={u} onToggle={handleToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
