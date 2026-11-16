import { Bell } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

export default function AdminSnacks() {
  return (
    <ComingSoon
      icon={Bell}
      title="Snack Orders"
      description="Live list of tea and coffee orders."
    />
  );
}
