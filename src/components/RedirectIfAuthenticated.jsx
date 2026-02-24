import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RedirectIfAuthenticated = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si el usuario está autenticado, redirigir según su rol
  if (user) {
    const userRole = user?.Role?.toLowerCase();
    
    if (userRole === "cliente") {
      return <Navigate to="/cliente/productos" replace />;
    } else {
      // Para admin y otros roles, ir al dashboard
      const lastPath = localStorage.getItem('lastPath');
      return <Navigate to={lastPath || "/dashboard/graficosEstadisticos"} replace />;
    }
  }

  // Si no está autenticado, mostrar el contenido (ruta pública)
  return children;
};