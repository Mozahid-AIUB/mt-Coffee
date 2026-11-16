import { Loader2 } from "lucide-react";

export default function Button({ loading = false, children, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-accent to-accent-hover font-semibold text-accent-fg shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0"
      {...props}
    >
      {loading && <Loader2 className="size-5 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
