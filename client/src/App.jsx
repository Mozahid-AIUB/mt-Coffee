import { Coffee } from "lucide-react";

export default function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-accent text-accent-fg shadow-card">
          <Coffee className="size-8" />
        </div>
        <h1 className="text-2xl font-semibold">Manush Tech</h1>
        <p className="mt-1 text-sm text-muted">Lunch & Snacks</p>
      </div>
      <div className="rounded-card border border-border bg-surface p-6 shadow-card">
        <button className="h-12 w-full rounded-xl bg-accent font-medium text-accent-fg hover:bg-accent-hover">
          Test Button
        </button>
      </div>
    </main>
  );
}