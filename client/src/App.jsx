import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Lunch from "./pages/Lunch";
import Snacks from "./pages/Snacks";
import AdminLunch from "./pages/AdminLunch";
import AdminReports from "./pages/AdminReports";
import AdminSnacks from "./pages/AdminSnacks";
import AdminEmployees from "./pages/AdminEmployees";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import AppLayout from "./components/AppLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Any signed-in user can open these pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/lunch" element={<Lunch />} />
          <Route path="/snacks" element={<Snacks />} />

          {/* Admin only */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/lunch-menu" element={<AdminLunch />} />
            <Route path="/admin/lunch-report" element={<AdminReports />} />
            <Route path="/admin/snacks" element={<AdminSnacks />} />
            <Route path="/admin/employees" element={<AdminEmployees />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
