import { Coffee } from "lucide-react";
import { motion } from "motion/react";
import ThemeToggle from "./ThemeToggle";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* পেছনের নরম আলোর গোলক */}
      <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 size-96 rounded-full bg-accent/15 blur-3xl" />

      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 grid size-20 place-items-center rounded-3xl bg-linear-to-br from-accent to-accent-hover text-accent-fg shadow-xl shadow-accent/30">
              <Coffee className="size-10" aria-hidden />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>

          <div className="rounded-3xl border border-border bg-surface/80 p-7 shadow-card backdrop-blur-xl">
            {children}
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            © Manush Tech · Lunch &amp; Snacks
          </p>
        </motion.div>
      </main>
    </div>
  );
}
