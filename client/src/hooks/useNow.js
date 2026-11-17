import { useEffect, useState } from "react";

// নির্দিষ্ট সময় পর পর "এখন কটা বাজে" আপডেট করে (countdown এর জন্য)
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
