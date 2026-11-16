import { useId, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function FormInput({
  label,
  error,
  icon: Icon,
  type = "text",
  ref,
  ...props
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
            aria-hidden
          />
        )}
        <input
          id={id}
          ref={ref}
          type={isPassword && show ? "text" : type}
          aria-invalid={!!error}
          className={`h-13 w-full rounded-2xl border bg-surface text-base shadow-sm outline-none transition placeholder:text-muted/60 focus:ring-4 focus:ring-[var(--ring)] ${
            error ? "border-danger" : "border-border focus:border-accent"
          } ${Icon ? "pl-12" : "pl-4"} ${isPassword ? "pr-12" : "pr-4"}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted transition hover:text-fg"
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
