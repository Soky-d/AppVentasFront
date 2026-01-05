import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 CONVERSIÓN CLAVE
  const userRole = Number(user.tipo);

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;