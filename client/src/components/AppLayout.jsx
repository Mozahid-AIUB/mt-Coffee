import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

// Login এর পরের সব পেজের কাঠামো: ওপরে Navbar, পাশে Sidebar, মাঝে পেজ
export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="min-h-dvh">
      <Navbar open={open} onToggle={toggle} />
      <Sidebar open={open} onClose={close} newSnackOrders={0} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
