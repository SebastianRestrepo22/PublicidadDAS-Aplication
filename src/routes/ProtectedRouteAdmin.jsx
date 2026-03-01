// ProtectedRouteAdmin.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export const ProtectedRouteAdmin = ({ children }) => {
  const { user, loading, hasPermission } = useAuth();
  const [redirectPath, setRedirectPath] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && user.Role !== "cliente") {
      // Definir los módulos del dashboard con sus permisos y rutas
      const modules = [
        { permission: "ver_dashboard", path: "/dashboard/graficosEstadisticos" },
        { permission: "ver_categorias", path: "/dashboard/categorias" },
        { permission: "ver_usuarios", path: "/dashboard/usuarios" },
        { permission: "ver_roles", path: "/dashboard/roles" },
        { permission: "ver_proveedores", path: "/dashboard/proveedores" },
        { permission: "ver_productos", path: "/dashboard/producto" },
        { permission: "ver_servicios", path: "/dashboard/servicio" },
        { permission: "ver_ventas", path: "/dashboard/ventas" },
        { permission: "ver_clientes", path: "/dashboard/clientes" },
        { permission: "ver_pedidos", path: "/dashboard/pedidosClientes" },
        { permission: "ver_compras", path: "/dashboard/compras" }
      ];

      // Encontrar el primer módulo al que tiene acceso
      const firstAvailableModule = modules.find(module => 
        hasPermission(module.permission)
      );

      if (firstAvailableModule) {
        setRedirectPath(firstAvailableModule.path);
      } else {
        // Si no tiene acceso a ningún módulo, redirigir a sin-acceso
        setRedirectPath("/dashboard/sin-acceso");
      }
    }
  }, [loading, user, hasPermission]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si es cliente, redirigir a su área
  if (user.Role === "cliente") {
    return <Navigate to="/cliente/productos" replace />;
  }

  // Si estamos en la raíz del dashboard, redirigir al primer módulo disponible
  if (location.pathname === "/dashboard" && redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // Si estamos en sin-acceso pero TIENE permisos para algún módulo, redirigir
  if (location.pathname === "/dashboard/sin-acceso" && redirectPath && redirectPath !== "/dashboard/sin-acceso") {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};