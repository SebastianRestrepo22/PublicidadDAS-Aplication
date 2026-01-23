import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  UserCheck,
  Wrench,
  Package,
  Palette,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import Modal from "./modals/modal";
import { useAuth } from "../../../context/AuthContext";

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
    to: "/dashboard/diseño",
    requiredPermission: "ver_categorias"
  },
  {
    icon: Wrench,
    label: "Productos",
    to: "/dashboard/producto",
    requiredPermission: "ver_productos"
  },
  {
    icon: Wrench,
    label: "Servicios",
    to: "/dashboard/servicio",
    requiredPermission: "ver_servicios"
  },
  {
    icon: Package,
    label: "Control Insumos",
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
      }
    ]
  },
  {
    icon: ShoppingCart,
    label: "Ventas",
    hasSubmenu: true,
    submenu: [
      {
        label: "Pedidos",
        to: "/dashboard/pedidosClientes",
        requiredPermission: "ver_pedidos"
      },
      {
        label: "Ventas",
        to: "/dashboard/ventas",
        requiredPermission: "ver_ventas"
      }
    ]
  }
];

export const Sidebar = () => {
  const { logout, user, loading, hasPermission } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);

  // Filtrar menú basado en permisos
  useEffect(() => {
    if (loading || !user) {
      setFilteredMenuItems([]);
      return;
    }

    // Si es administrador, mostrar todo
    if (user.Role === "administrador") {
      setFilteredMenuItems(menuItems);
      return;
    }

    const filtered = menuItems
      .map(item => {
        if (!item.hasSubmenu) {
          return hasPermission(item.requiredPermission) ? item : null;
        }

        const filteredSubmenu = item.submenu?.filter(subItem =>
          hasPermission(subItem.requiredPermission)
        ) || [];

        return filteredSubmenu.length > 0 ? {
          ...item,
          filteredSubmenu
        } : null;
      })
      .filter(Boolean);

    setFilteredMenuItems(filtered);
  }, [user, loading, hasPermission]);

  const toggleSubmenu = (index) => {
    setExpandedItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (!user) {
    return null;
  }

  if (loading) {
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

      <nav className="flex-1 overflow-y-auto scrollbar-hide">
        <ul className="space-y-1">
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item, index) => {
              const filteredSubmenu = item.filteredSubmenu || item.submenu;
              const hasVisibleSubmenu = filteredSubmenu && filteredSubmenu.length > 0;

              return (
                <li key={index}>
                  <div className={`flex items-center justify-between px-4 py-3 hover:bg-gray-800 rounded-md transition-colors duration-200 group ${item.hasSubmenu && hasVisibleSubmenu ? "cursor-pointer" : ""}`}>
                    {!item.hasSubmenu ? (
                      <Link to={item.to} className="flex items-center gap-3 flex-1" title={item.label}>
                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs font-medium">{item.label}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center flex-1 justify-between">
                        <Link to={item.to} className="flex items-center gap-3 flex-1" title={item.label}>
                          <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                        {hasVisibleSubmenu && (
                          <button onClick={() => toggleSubmenu(index)} className="ml-1 focus:outline-none">
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
                          <Link to={subItem.to} className="block px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors duration-200">
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
            !loading && user && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-400">
                  No tienes permisos para acceder a ninguna sección
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Contacta al administrador
                </p>
              </div>
            )
          )}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button onClick={() => setOpenModal(true)} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-medium py-3 px-3 rounded-md hover:bg-red-700 transition-colors">
          <LogOut className="w-3 h-3" />
          Salir
        </button>

        <Modal open={openModal} onClose={() => setOpenModal(false)} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-[400px] p-6 mx-auto text-center bg-white rounded shadow-lg relative z-50">
            <p className="mb-6 text-black">¿Está seguro que quiere cerrar sesión?</p>
            <div className="flex gap-4">
              <button className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors" onClick={() => { logout(); setOpenModal(false); }}>
                Cerrar sesión
              </button>
              <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition-colors" onClick={() => setOpenModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};