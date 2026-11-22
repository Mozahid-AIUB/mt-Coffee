import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Admin ছাড়া অন্য কেউ ঢুকলে Lunch পেজে পাঠায়
export default function AdminRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/lunch" replace />;
  return <Outlet />;
}
