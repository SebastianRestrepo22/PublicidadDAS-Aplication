import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // Añadir estado de carga
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!user) return <Navigate to="/login" />;
  
  const userRole = user.Role?.toLowerCase();
  const requiredRole = role?.toLowerCase();
  
  if (requiredRole && userRole !== requiredRole) {
    // Redirigir según el tipo de usuario
    if (userRole === "cliente") {
      return <Navigate to="/cliente/productos" />;
    } else {
      return <Navigate to="/dashboard/graficosEstadisticos" />;
    }
  }

  return children;
};