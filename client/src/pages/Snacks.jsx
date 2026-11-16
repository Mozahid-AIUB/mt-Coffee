import { Coffee } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

export default function Snacks() {
  return (
    <ComingSoon
      icon={Coffee}
      title="Snacks"
      description="Order tea or coffee between 8:00 AM and 8:00 PM."
    />
  );
}
