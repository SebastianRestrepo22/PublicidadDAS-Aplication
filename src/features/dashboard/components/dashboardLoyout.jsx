import { useEffect, useState } from "react"
import { Sidebar } from "./sidebar"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"

export function DashboardLayout() {
  const { user, loading, hasPermission } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    // Si no hay usuario y no está cargando, redirige al login
    if (!loading && !user) {
      navigate('/login')
      return
    }

    // Solo ejecutar la redirección si estamos en la raíz exacta /dashboard
    if (!loading && user && location.pathname === '/dashboard') {
      setIsRedirecting(true)
      
      // Lista de rutas en orden de prioridad (de más importante a menos)
      const prioritizedRoutes = [
        { path: "/dashboard/graficosEstadisticos", permission: "ver_dashboard" },
        { path: "/dashboard/ventas", permission: "ver_ventas" },
        { path: "/dashboard/pedidosClientes", permission: "ver_pedidos" },
        { path: "/dashboard/producto", permission: "ver_productos" },
        { path: "/dashboard/servicio", permission: "ver_servicios" },
        { path: "/dashboard/usuarios", permission: "ver_usuarios" },
        { path: "/dashboard/roles", permission: "ver_roles" },
        { path: "/dashboard/categorias", permission: "ver_categorias" },
        { path: "/dashboard/proveedores", permission: "ver_proveedores" },
        { path: "/dashboard/compras", permission: "ver_compras" },
        { path: "/dashboard/clientes", permission: "ver_clientes" },
        { path: "/dashboard/insumos", permission: "ver_insumos" },
      ];

      // Encontrar la primera ruta a la que el usuario tiene acceso
      const firstAccessibleRoute = prioritizedRoutes.find(route => 
        hasPermission(route.permission)
      );

      if (firstAccessibleRoute) {
        navigate(firstAccessibleRoute.path, { replace: true })
      } else {
        // Si no tiene acceso a ninguna ruta, ir a sin-acceso
        navigate("/dashboard/sin-acceso", { replace: true })
      }
      
      setTimeout(() => setIsRedirecting(false), 100)
    } else {
      setIsRedirecting(false)
    }
  }, [user, loading, location.pathname, navigate, hasPermission])

  if (loading || (location.pathname === '/dashboard' && isRedirecting)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}