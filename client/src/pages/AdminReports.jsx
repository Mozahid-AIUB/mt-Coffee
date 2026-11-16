import { FileText } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

export default function AdminReports() {
  return (
    <ComingSoon
      icon={FileText}
      title="Lunch Report"
      description="See who chose what, with totals and CSV export."
    />
  );
}
