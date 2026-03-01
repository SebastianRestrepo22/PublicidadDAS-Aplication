import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Home } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export const SinAcceso = () => {
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const [hasAnyPermission, setHasAnyPermission] = useState(false);
  const [firstAvailablePath, setFirstAvailablePath] = useState("/dashboard");

  useEffect(() => {
    // Verificar si el usuario tiene ALGÚN permiso
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
    const firstAvailable = modules.find(module => hasPermission(module.permission));
    
    if (firstAvailable) {
      setHasAnyPermission(true);
      setFirstAvailablePath(firstAvailable.path);
    } else {
      setHasAnyPermission(false);
    }
  }, [hasPermission]);

  const handleGoToDashboard = () => {
    // Si tiene algún permiso, ir al primer módulo disponible
    if (hasAnyPermission) {
      navigate(firstAvailablePath);
    } else {
      // Si no tiene ningún permiso, ir a la raíz del dashboard (que luego redirigirá a sin-acceso de nuevo)
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center">
          <Shield className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          {hasAnyPermission ? "Módulo sin acceso" : "Acceso Denegado"}
        </h1>
        <p className="text-gray-600 mb-6">
          {hasAnyPermission 
            ? "No tienes permisos para esta sección específica, pero puedes acceder a otras áreas del dashboard."
            : "No tienes permisos suficientes para acceder al dashboard."}
        </p>
        
        <button
          onClick={handleGoToDashboard}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Home className="w-4 h-4" />
          {hasAnyPermission ? "Ir al dashboard" : "Volver al inicio"}
        </button>
      </div>
    </div>
  );
};