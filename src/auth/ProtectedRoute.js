import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  // 🔐 VALIDACIÓN REAL
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
