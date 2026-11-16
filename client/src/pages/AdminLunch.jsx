import { ClipboardList } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

export default function AdminLunch() {
  return (
    <ComingSoon
      icon={ClipboardList}
      title="Lunch Menu Management"
      description="Create and edit the lunch menu for each day."
    />
  );
}
