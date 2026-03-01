import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  UserCheck,
  Package,
  Printer,
  Boxes,
  Palette,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const menuItems = [
  {
    icon: BarChart3,
    label: "Medición y Desempeño",
    hasSubmenu: true,
    submenu: [
      {
        label: "Dashboard",
        to: "/dashboard/graficosEstadisticos",
        requiredPermission: "ver_dashboard"
      }
    ]
  },
  {
    icon: UserCheck,
    label: "Configuración",
    hasSubmenu: true,
    submenu: [
      {
        label: "Roles",
        to: "/dashboard/roles",
        requiredPermission: "ver_roles"
      }
    ]
  },
  {
    icon: Users,
    label: "Usuarios",
    to: "/dashboard/usuarios",
    requiredPermission: "ver_usuarios"
  },
  {
    icon: Boxes,
    label: "Compras",
    hasSubmenu: true,
    submenu: [
      {
        label: "Categorías",
        to: "/dashboard/categorias",
        requiredPermission: "ver_categorias"
      },
      {
        label: "Productos",
        to: "/dashboard/producto",
        requiredPermission: "ver_productos"
      },
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
    ]
  },
  {
    icon: ShoppingCart,
    label: "Ventas",
    hasSubmenu: true,
    submenu: [
      {
        label: "Servicios",
        to: "/dashboard/servicio",
        requiredPermission: "ver_servicios"
      },
      {
        label: "Clientes",
        to: "/dashboard/clientes",
        requiredPermission: "ver_clientes"
      },
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

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className={`
        w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-2xl border border-gray-800 overflow-hidden
        transform transition-all duration-300 ease-out
        ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
      `}>
        {/* Modal Header with Close Button */}
        <div className="flex justify-between items-center p-6 pb-0">
          <div></div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="p-8 pt-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-700 to-red-800 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <LogOut className="w-10 h-10 text-red-200" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Cerrar Sesión</h3>
          <p className="text-gray-300 mb-8">
            ¿Está seguro que quiere cerrar sesión?<br />
            <span className="text-sm text-gray-400">Será redirigido a la página de inicio</span>
          </p>
          <div className="flex gap-3">
            <button
              className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-900/30 transform hover:-translate-y-0.5 active:translate-y-0"
              onClick={onConfirm}
            >
              Salir
            </button>
            <button
              className="flex-1 py-3.5 bg-gray-800 text-gray-200 font-semibold rounded-lg hover:bg-gray-700 transition-all duration-300 border border-gray-700 transform hover:-translate-y-0.5 active:translate-y-0"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>
        <div className="px-8 py-4 bg-gray-900/50 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-400">
            PublicidadDAS • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const { logout, user, loading, hasPermission } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [activeItem, setActiveItem] = useState("");

  useEffect(() => {
    if (loading || !user) {
      setFilteredMenuItems([]);
      return;
    }

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
    setExpandedItems(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [index];
      }
    });
  };

  const handleLogout = () => {
    logout();
    setOpenModal(false);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-72 min-h-screen bg-gray-900 border-r border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="h-8 w-32 bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 rounded-full animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sidebar Container - Modificado para contenido dinámico */}
      <div className="w-72 h-screen bg-gray-900 border-r border-gray-800 flex flex-col shadow-2xl shadow-black/40">
        
        {/* User Profile Header */}
        <div className="p-6 border-b border-gray-800 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-bold text-white text-xl">
              Panel Administrativo
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {user?.NombreCompleto?.charAt(0) || user?.CorreoElectronico?.charAt(0) || "U"}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full border-2 border-gray-900"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">
                {user?.NombreCompleto?.split(' ')[0] || "Usuario"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-1 bg-gray-800 text-cyan-300 text-xs font-medium rounded-full">
                  {user?.Role || "Rol no asignado"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Permitir scroll solo cuando sea necesario */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <nav className="py-4 px-3">
              <div className="space-y-1">
                {filteredMenuItems.length > 0 ? (
                  filteredMenuItems.map((item, index) => {
                    const filteredSubmenu = item.filteredSubmenu || item.submenu;
                    const hasVisibleSubmenu = filteredSubmenu && filteredSubmenu.length > 0;

                    return (
                      <div key={index} className="relative">
                        {/* Main Menu Item */}
                        <div className="group relative">
                          {!item.hasSubmenu ? (
                            <Link
                              to={item.to}
                              onClick={() => setActiveItem(item.label)}
                              className={`
                                flex items-center gap-3
                                px-3 py-3.5
                                rounded-xl
                                transition-all duration-200
                                group-hover:bg-gray-800
                                group-hover:shadow-md
                                ${activeItem === item.label ? 'bg-gray-800 shadow-inner' : ''}
                              `}
                            >
                              <div className="relative">
                                <item.icon className={`w-5 h-5 text-cyan-500 transition-all duration-300 group-hover:scale-110 ${activeItem === item.label ? 'scale-110' : ''}`} />
                              </div>
                              
                              <div className="flex-1 flex items-center justify-between">
                                <span className={`text-sm font-medium transition-all duration-300 ${activeItem === item.label ? 'text-white' : 'text-gray-300'}`}>
                                  {item.label}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <div
                              onClick={() => toggleSubmenu(index)}
                              className={`
                                flex items-center gap-3
                                px-3 py-3.5
                                rounded-xl
                                cursor-pointer
                                transition-all duration-200
                                hover:bg-gray-800
                                hover:shadow-md
                                ${expandedItems.includes(index) ? 'bg-gray-800 shadow-inner' : ''}
                              `}
                            >
                              <item.icon className={`w-5 h-5 text-cyan-500 transition-all duration-300 ${expandedItems.includes(index) ? 'scale-110' : ''}`} />
                              
                              <>
                                <span className={`flex-1 text-sm font-medium transition-all duration-300 ${expandedItems.includes(index) ? 'text-white' : 'text-gray-300'}`}>
                                  {item.label}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedItems.includes(index) ? 'rotate-180 text-cyan-500' : 'text-gray-500'}`} />
                              </>
                            </div>
                          )}
                        </div>

                        {/* Submenu Items */}
                        {item.hasSubmenu && hasVisibleSubmenu && expandedItems.includes(index) && (
                          <div className="ml-3 mt-1 pl-8 border-l border-gray-800 space-y-1 py-2">
                            {filteredSubmenu.map((subItem, subIndex) => (
                              <Link
                                key={subIndex}
                                to={subItem.to}
                                onClick={() => setActiveItem(subItem.label)}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 group"
                              >
                                <div className="w-1.5 h-1.5 bg-gray-700 rounded-full group-hover:bg-cyan-400 transition-colors"></div>
                                <span>{subItem.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  !loading && user && (
                    <div className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium mb-2">
                        Sin permisos asignados
                      </p>
                      <p className="text-xs text-gray-500">
                        Contacta al administrador
                      </p>
                    </div>
                  )
                )}
              </div>
            </nav>
          </div>
        </div>

        {/* Footer - Fijo en la parte inferior */}
        <div className="p-4 border-t border-gray-800 shrink-0 mt-auto">
          <div
            className={`
              flex items-center justify-between
              px-3 py-3
              bg-gradient-to-r from-red-600/20 to-red-700/10
              rounded-xl
              border border-red-800/30
              group hover:from-red-600/30 hover:to-red-700/20
              transition-all duration-300
              cursor-pointer
              transform hover:-translate-y-0.5 active:translate-y-0
            `}
            onClick={() => setOpenModal(true)}
            title="Cerrar sesión"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600/30 rounded-lg group-hover:bg-red-600/40 transition-colors">
                <LogOut className="w-4 h-4 text-red-300 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">Cerrar sesión</p>
                <p className="text-xs text-gray-300">Salir del sistema</p>
              </div>
            </div>
            
            <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
          </div>
        </div>
      </div>

      {/* Logout Modal Component */}
      <LogoutModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};