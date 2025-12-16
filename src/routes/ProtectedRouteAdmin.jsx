import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRouteAdmin = ({ children }) => {
  const { user, loading } = useAuth();

  // Añadir estado de carga
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  } 

  // Obtener el rol en minúsculas para comparación
  const userRole = user?.Role?.toLowerCase();
  
  // Solo clientes NO pueden acceder al dashboard
  if (userRole === "cliente") {
    return <Navigate to="/cliente/productos" />;
  }

  // CUALQUIER otro rol (administrador, empleado, vendedor, diseñador, etc.)
  // SÍ puede acceder al dashboard
  return children;
};