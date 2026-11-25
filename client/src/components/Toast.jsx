import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, X, AlertCircle } from "lucide-react";

// Small toast in the top-right corner that dismisses itself
// Usage: <Toast message="..." type="success" onClose={fn} />

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
};

const colors = {
  success: "bg-success/15 text-success border-success/30",
  error: "bg-danger/15 text-danger border-danger/30",
};

export default function Toast({ message, type = "success", duration = 3000, onClose }) {
  const [show, setShow] = useState(true);
  const Icon = icons[type] || CheckCircle2;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 50, y: -10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg ${colors[type]}`}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="flex-1">{message}</span>
          <button
            type="button"
            onClick={() => { setShow(false); setTimeout(onClose, 100); }}
            className="grid size-5 shrink-0 place-items-center rounded-full opacity-60 hover:opacity-100"
            aria-label="Close"
          >
            <X className="size-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Container that stacks several toasts
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast message={t.message} type={t.type} duration={t.duration} onClose={() => removeToast(t.id)} />
        </div>
      ))}
    </div>
  );
}
