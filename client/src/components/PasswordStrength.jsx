export default function PasswordStrength({ value = "" }) {
  if (!value) return null;

  const checks = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[a-z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ];
  const score = checks.filter(Boolean).length;
  const filled = Math.min(4, Math.max(1, score - 1));

  const levels = [
    { label: "Weak", text: "text-danger", bar: "bg-danger" },
    { label: "Fair", text: "text-warning", bar: "bg-warning" },
    { label: "Good", text: "text-success", bar: "bg-success" },
    { label: "Strong", text: "text-success", bar: "bg-success" },
  ];
  const level = levels[filled - 1];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= filled ? level.bar : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs font-medium ${level.text}`}>
        Password strength: {level.label}
      </p>
    </div>
  );
}
