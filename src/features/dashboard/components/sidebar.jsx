import { useState } from "react";
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
} from "lucide-react";
import Modal from "./modals/modal";
import { Label } from "recharts";
import { useAuth } from "../../../context/AuthContext";

const menuItems = [
  { icon: BarChart3, label: "Gráficos Estadísticos", to: "/dashboard/graficosEstadisticos" },
  { icon: UserCheck, label: "Roles", to: "/dashboard/roles" },
  { icon: Users, label: "Usuarios", to: "/dashboard/usuarios" },
  { icon: Wrench, label: "Servicios", to: "/dashboard/productoServicio" },
  {
    icon: Package,
    label: "Control Insumos",
    to: "/dashboard/insumos",
    hasSubmenu: true,
    submenu: [
      { label: "Proveedores", to: "/dashboard/proveedores" },
      { label: "Compras", to: "/dashboard/compras" },
      { label: "Insumos", to: "/dashboard/insumos" },
    ],
  },
  { icon: Palette, label: "Diseño", to: "/dashboard/Diseño" },
  {
    icon: ShoppingCart,
    label: "Gestión de Ventas",
    to: "/dashboard/gestionVentas",
    hasSubmenu: true,
    submenu: [
      { label: "Pedidos", to: "/dashboard/pedidos" },
      { label: "Produccion", to: "/dashboard/produccion" },
      { label: "Venta", to: "/dashboard/ventas" }
    ]
  },
  { icon: CalendarDays, label: "Agenda", to: "/dashboard/agenda" }
];

export const Sidebar = () => {
  const { logout } = useAuth();

  const [openModal, setOpenModal] = useState(false);

  const [expandedItems, setExpandedItems] = useState([]);

  const toggleSubmenu = (index) => {
    setExpandedItems((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="w-48 min-h-screen bg-gray-900 space-y-3 py-4 text-white flex flex-col justify-between">
      {/* Encabezado */}
      <div className="p-4 pb-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white tracking-tight">Dashboard</h1>
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <div
                className={`flex items-center justify-between px-4 py-3 hover:bg-gray-800 rounded-md transition-colors duration-200 group ${item.hasSubmenu ? "cursor-pointer" : ""
                  }`}
              >
                {!item.hasSubmenu ? (
                  <Link to={item.to} className="flex items-center gap-3 flex-1">
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                ) : (
                  <div className="flex items-center flex-1 justify-between">
                    <Link to={item.to} className="flex items-center gap-3 flex-1">
                      <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                    <button
                      onClick={() => toggleSubmenu(index)}
                      className="ml-1 focus:outline-none"
                    >
                      {expandedItems.includes(index) ? (
                        <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {item.hasSubmenu && expandedItems.includes(index) && (
                <ul className="ml-5 mt-1 space-y-3 py-4 border-l border-gray-700 pl-3">
                  {item.submenu?.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <Link
                        to={subItem.to}
                        className="block px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors duration-200"
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <Link
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-medium  py-3 px-3 rounded-md hover:bg-red-700 transition-colors"
          onClick={() => setOpenModal(true)}
        >
          <LogOut className="w-3 h-3" />
          Salir

        </Link>

        {/*Modales */}

        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
        >
          <div className="w-[400px] p-6 mx-auto text-center bg-white rounded shadow-lg relative z-50">
            <p className="mb-6 text-black">¿Está seguro que quiere cerrar sesión?</p>
            <div className="flex gap-4">
              <Link
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
                onClick={() => {
                  logout(); //borra token y setea user(null)
                }}
                to="/login"
              >
                Cerrar sesión
              </Link>
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
