// Badge for an order status: pending, preparing, served or cancelled
const styles = {
  pending: "bg-warning/15 text-warning",
  preparing: "bg-accent/15 text-accent",
  served: "bg-success/15 text-success",
  cancelled: "bg-danger/15 text-danger",
};

const labels = {
  pending: "Pending",
  preparing: "Preparing",
  served: "Served",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase();

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        styles[key] || "bg-surface-2 text-muted"
      }`}
    >
      {labels[key] || status}
    </span>
  );
}
