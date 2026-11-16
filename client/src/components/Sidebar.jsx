import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  UtensilsCrossed,
  Coffee,
  ClipboardList,
  FileText,
  Bell,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { popupConfirm } from "../utils/popup";

function Item({ to, icon: Icon, label, badge = 0, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
          isActive
            ? "bg-accent text-accent-fg shadow-lg shadow-accent/30"
            : "text-fg hover:bg-surface-2"
        }`
      }
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="grid min-w-6 place-items-center rounded-full bg-danger px-1.5 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose, newSnackOrders = 0 }) {
  const { user, isAdmin, logout } = useAuth();

  // Esc চাপলে বন্ধ হবে
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleLogout = async () => {
    const ok = await popupConfirm("Log out?", "You will need to log in again.", "Yes, log out");
    if (ok) {
      onClose();
      logout();
    }
  };

  const initials = (user?.fullName || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* পেছনের অন্ধকার পর্দা: এখানে চাপলে বন্ধ হবে */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
            className="fixed inset-0 top-16 z-30 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            key="panel"
            id="app-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-0 left-0 top-16 z-30 flex w-72 max-w-[85vw] flex-col border-r border-border bg-surface shadow-2xl"
          >
            <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto p-4">
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">
                Menu
              </p>
              <Item to="/lunch" icon={UtensilsCrossed} label="Lunch" onClick={onClose} />
              <Item to="/snacks" icon={Coffee} label="Snacks" onClick={onClose} />

              {isAdmin && (
                <>
                  <p className="px-2 pb-1 pt-5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Admin
                  </p>
                  <Item
                    to="/admin/lunch-menu"
                    icon={ClipboardList}
                    label="Lunch Menu Management"
                    onClick={onClose}
                  />
                  <Item
                    to="/admin/lunch-report"
                    icon={FileText}
                    label="Lunch Report"
                    onClick={onClose}
                  />
                  <Item
                    to="/admin/snacks"
                    icon={Bell}
                    label="Snack Orders"
                    badge={newSnackOrders}
                    onClick={onClose}
                  />
                  <Item to="/admin/employees" icon={Users} label="Employees" onClick={onClose} />
                </>
              )}
            </nav>

            <div className="border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="mb-3 flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-fg">
                  {initials}
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-semibold">{user?.fullName}</p>
                  <p className="truncate text-xs text-muted">
                    {user?.employeeId} · <span className="capitalize">{user?.role}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border text-sm font-medium text-danger transition hover:bg-danger/10 active:scale-[0.98]"
              >
                <LogOut className="size-4" aria-hidden />
                Logout
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
