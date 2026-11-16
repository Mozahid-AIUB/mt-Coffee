import { Coffee, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ open, onToggle }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-bg/85 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="app-sidebar"
          className="grid size-11 place-items-center rounded-2xl border border-border bg-surface text-fg shadow-sm transition hover:bg-surface-2 active:scale-95"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-accent to-accent-hover text-accent-fg">
            <Coffee className="size-5" aria-hidden />
          </div>
          <span className="font-semibold tracking-tight">Manush Tech</span>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
