import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RedirectIfAuthenticated = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Obtener la ruta actual
  const currentPath = window.location.pathname;

  // Rutas que SIEMPRE deben ser accesibles incluso para usuarios logueados
  const rutasPublicasPermitidas = [
    '/carritodecompras',
    '/editarcarritoservicio',
    '/checkout',
    '/pedido-exitoso',
    '/productos/',  // Todos los detalles de productos
    '/servicios/'   // Todos los detalles de servicios
  ];

  // Verificar si la ruta actual está en la lista de permitidas
  const esRutaPermitida = rutasPublicasPermitidas.some(ruta => 
    currentPath.startsWith(ruta)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si el usuario está autenticado
  if (user) {
    const userRole = user?.Role?.toLowerCase();
    
    // CASO 1: Está en una ruta permitida (carrito o detalles) - PERMITIR
    if (esRutaPermitida) {
      return children;
    }
    
    // CASO 2: Está en cualquier otra ruta - REDIRIGIR según su rol
    if (userRole === "cliente") {
      return <Navigate to="/cliente/productos" replace />;
    } else {
      const lastPath = localStorage.getItem('lastPath');
      return <Navigate to={lastPath || "/dashboard/graficosEstadisticos"} replace />;
    }
  }

  // Si no está autenticado, mostrar el contenido (ruta pública)
  return children;
};