import { UtensilsCrossed } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

export default function Lunch() {
  return (
    <ComingSoon
      icon={UtensilsCrossed}
      title="Lunch"
      description="Choose your lunch for each working day (Sunday to Thursday)."
    />
  );
}
