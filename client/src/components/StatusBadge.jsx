// অর্ডারের status দেখানোর ব্যাজ — pending, preparing, served, cancelled
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
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] || "bg-surface-2 text-muted"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
