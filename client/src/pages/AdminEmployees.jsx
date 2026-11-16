import { Users } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

export default function AdminEmployees() {
  return (
    <ComingSoon
      icon={Users}
      title="Employees"
      description="Search employees and activate or deactivate accounts."
    />
  );
}
