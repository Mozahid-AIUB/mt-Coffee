export default function ComingSoon({ icon: Icon, title, description }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <div className="mt-8 grid place-items-center rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
        <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-accent/15 text-accent">
          <Icon className="size-8" aria-hidden />
        </div>
        <p className="font-semibold">Coming soon</p>
        <p className="mt-1 max-w-xs text-sm text-muted">
          This page will be built in a later step.
        </p>
      </div>
    </div>
  );
}
