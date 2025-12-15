import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  UserCheck,
  Wrench,
  Package,
  Palette,
  ShoppingCart,
  CreditCard,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  LogOut,
  MonitorCheck,
} from "lucide-react";
import Modal from "./modals/modal";
import { useAuth } from "../../../context/AuthContext";

// Mapeo de rutas a permisos requeridos
const permissionMap = {
  "/dashboard/graficosEstadisticos": ["ver_dashboard"],
  "/dashboard/roles": ["ver_roles"],
  "/dashboard/usuarios": ["ver_usuarios"],
  "/dashboard/Diseño": ["ver_diseno"],
  "/dashboard/productoServicio": ["ver_servicios"],
  "/dashboard/proveedores": ["ver_proveedores"],
  "/dashboard/compras": ["ver_compras"],
  "/dashboard/insumos": ["ver_insumos"],
  "/dashboard/pedidosClientes": ["ver_pedidos"],
  "/dashboard/produccion": ["ver_produccion"],
  "/dashboard/ventas": ["ver_ventas"],
  "/dashboard/agenda": ["ver_agenda"],
  "/dashboard/gestionVentas": ["ver_ventas", "ver_pedidos", "ver_produccion"], // Cualquiera de estos
};

// Configuración completa del menú con permisos
const menuItems = [
  { 
    icon: BarChart3, 
    label: "Gráficos Estadísticos", 
    to: "/dashboard/graficosEstadisticos",
    requiredPermission: "ver_dashboard"
  },
  { 
    icon: UserCheck, 
    label: "Roles", 
    to: "/dashboard/roles",
    requiredPermission: "ver_roles"
  },
  { 
    icon: Users, 
    label: "Usuarios", 
    to: "/dashboard/usuarios",
    requiredPermission: "ver_usuarios"
  },
  { 
    icon: Palette, 
    label: "Diseño", 
    to: "/dashboard/Diseño",
    requiredPermission: "ver_diseno"
  },
  { 
    icon: Wrench, 
    label: "Servicios", 
    to: "/dashboard/productoServicio",
    requiredPermission: "ver_servicios"
  },
  {
    icon: Package,
    label: "Control Insumos",
    to: "/dashboard/insumos",
    hasSubmenu: true,
    submenu: [
      { 
        label: "Proveedores", 
        to: "/dashboard/proveedores",
        requiredPermission: "ver_proveedores"
      },
      { 
        label: "Compras", 
        to: "/dashboard/compras",
        requiredPermission: "ver_compras"
      },
      { 
        label: "Insumos", 
        to: "/dashboard/insumos",
        requiredPermission: "ver_insumos"
      },
    ],
  },
  {
    icon: ShoppingCart,
    label: "Gestión de Ventas",
    to: "/dashboard/gestionVentas",
    hasSubmenu: true,
    submenu: [
      { 
        label: "Pedidos", 
        to: "/dashboard/pedidosClientes",
        requiredPermission: "ver_pedidos"
      },
      { 
        label: "Produccion", 
        to: "/dashboard/produccion",
        requiredPermission: "ver_produccion"
      },
      { 
        label: "Venta", 
        to: "/dashboard/ventas",
        requiredPermission: "ver_ventas"
      }
    ]
  },
  { 
    icon: CalendarDays, 
    label: "Agenda", 
    to: "/dashboard/agenda",
    requiredPermission: "ver_agenda"
  }
];

export const Sidebar = () => {
  const { logout, user, permissions = [] } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permissionName) => {
    if (!permissions || permissions.length === 0) {
      return false;
    }
    
    // Si es administrador, tiene todos los permisos
    if (user?.Role?.toLowerCase() === "administrador") {
      return true;
    }
    
    return permissions.includes(permissionName);
  };

  // Verificar si tiene al menos uno de varios permisos
  const hasAnyPermission = (permissionNames) => {
    if (!permissionNames || permissionNames.length === 0) return true;
    
    if (user?.Role?.toLowerCase() === "administrador") {
      return true;
    }
    
    return permissionNames.some(perm => hasPermission(perm));
  };

  // Filtrar los items del menú basado en permisos
  const filterMenuItems = () => {
    return menuItems.filter(item => {
      // Verificar permiso para el item principal
      const mainItemHasPermission = hasPermission(item.requiredPermission);
      
      // Si no tiene submenú, solo verificar permiso principal
      if (!item.hasSubmenu) {
        return mainItemHasPermission;
      }
      
      // Si tiene submenú, filtrar subitems primero
      if (item.submenu) {
        const filteredSubmenu = item.submenu.filter(subItem => 
          hasPermission(subItem.requiredPermission)
        );
        
        // Mostrar el item principal si:
        // 1. Tiene permiso para el item principal O
        // 2. Tiene permiso para al menos un subitem
        const hasSubPermission = filteredSubmenu.length > 0;
        
        // Guardar el submenú filtrado
        item.filteredSubmenu = filteredSubmenu;
        
        return mainItemHasPermission || hasSubPermission;
      }
      
      return mainItemHasPermission;
    });
  };

  // Efecto para filtrar items cuando cambian los permisos
  useEffect(() => {
    const filtered = filterMenuItems();
    setFilteredMenuItems(filtered);
  }, [permissions, user]);

  const toggleSubmenu = (index) => {
    setExpandedItems((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  // Si no hay usuario (no está autenticado), no mostrar sidebar
  if (!user) {
    return null;
  }

  // Si está cargando, mostrar esqueleto
  if (permissions === null) {
    return (
      <div className="w-48 min-h-screen bg-gray-900 space-y-3 py-4 text-white flex flex-col justify-between">
        <div className="p-4 pb-6 border-b border-gray-700">
          <h1 className="text-lg font-bold text-white tracking-tight">Dashboard</h1>
          <div className="h-4 bg-gray-700 rounded animate-pulse mt-2"></div>
        </div>
        <div className="flex-1 space-y-1 px-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-48 min-h-screen bg-gray-900 space-y-3 py-4 text-white flex flex-col justify-between">
      {/* Encabezado con información del usuario */}
      <div className="p-4 pb-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white tracking-tight">Dashboard</h1>
        <div className="mt-2">
          <p className="text-xs text-gray-300 truncate">
            {user?.NombreCompleto || user?.CorreoElectronico || "Usuario"}
          </p>
          <p className="text-xs text-gray-400 capitalize">
            {user?.Role || "Rol no asignado"}
          </p>
        </div>
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide">
        <ul className="space-y-1">
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item, index) => {
              const filteredSubmenu = item.filteredSubmenu || item.submenu;
              const hasVisibleSubmenu = filteredSubmenu && filteredSubmenu.length > 0;
              
              return (
                <li key={index}>
                  <div
                    className={`flex items-center justify-between px-4 py-3 hover:bg-gray-800 rounded-md transition-colors duration-200 group ${item.hasSubmenu && hasVisibleSubmenu ? "cursor-pointer" : ""
                      }`}
                  >
                    {!item.hasSubmenu ? (
                      <Link 
                        to={item.to} 
                        className="flex items-center gap-3 flex-1"
                        title={item.label}
                      >
                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs font-medium">{item.label}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center flex-1 justify-between">
                        <Link 
                          to={item.to} 
                          className="flex items-center gap-3 flex-1"
                          title={item.label}
                        >
                          <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                        {hasVisibleSubmenu && (
                          <button
                            onClick={() => toggleSubmenu(index)}
                            className="ml-1 focus:outline-none"
                            aria-label={expandedItems.includes(index) ? "Contraer menú" : "Expandir menú"}
                          >
                            {expandedItems.includes(index) ? (
                              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {item.hasSubmenu && hasVisibleSubmenu && expandedItems.includes(index) && (
                    <ul className="ml-5 mt-1 space-y-3 py-4 border-l border-gray-700 pl-3">
                      {filteredSubmenu.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={subItem.to}
                            className="block px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors duration-200"
                            title={subItem.label}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400">
                No tienes permisos para acceder a ninguna sección
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Contacta al administrador
              </p>
            </div>
          )}
        </ul>
      </nav>

      {/* Botón de salir */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setOpenModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-medium py-3 px-3 rounded-md hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Salir
        </button>

        {/* Modal de confirmación de logout */}
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
        >
          <div className="w-[400px] p-6 mx-auto text-center bg-white rounded shadow-lg relative z-50">
            <p className="mb-6 text-black">¿Está seguro que quiere cerrar sesión?</p>
            <div className="flex gap-4">
              <button
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
                onClick={() => {
                  logout();
                  setOpenModal(false);
                }}
              >
                Cerrar sesión
              </button>
              <button
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setOpenModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};