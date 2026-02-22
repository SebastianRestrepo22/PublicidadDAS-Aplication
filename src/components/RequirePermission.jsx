import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequirePermission = ({ children, permission }) => {
  const { hasPermission, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/dashboard/sin-acceso" replace />;
  }

  return children;
};