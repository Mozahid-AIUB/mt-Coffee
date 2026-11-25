import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Sends anyone who is not an admin to the lunch page
export default function AdminRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/lunch" replace />;
  return <Outlet />;
}
