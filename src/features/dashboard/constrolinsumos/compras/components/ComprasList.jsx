import React, { useState } from "react";
import { Eye, Plus, Search } from "lucide-react";
import { Pagination } from "../../../components/paginacion/pagination";
import { ESTADOS_COMPRA } from "../hook/useCompras";
import HelpModal from "../../../components/modals/HelpModal";

const getShortId = (id) => {
  const str = String(id || "");
  return str.length > 3 ? str.substring(0, 3) : str;
};

const formatearFecha = (f) => {
  if (!f) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(f)) {
    const [year, month, day] = f.split('-');
    return `${day}/${month}/${year}`;
  }
  const d = new Date(f);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatPrice = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "$0";
  return num.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

// Configuración de estados - AHORA SOLO APROBADO
const estadoConfig = {
  [ESTADOS_COMPRA.APROBADO]: {
    color: 'bg-green-100 text-green-800',
    label: 'Aprobado',
  }
};

export const ComprasList = ({
  paginatedData,
  filtroText,
  setFiltroText,
  filtroCampo,
  setFiltroCampo,
  onView,
  onCreate,
  onRefresh,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
  cargandoDatos = false
}) => {
  // Filtrar localmente para la UI (igual que en Categorias)
  const comprasFiltradas = paginatedData.filter((compra) => {
    if (!filtroText) return true;
    const busqueda = filtroText.toLowerCase();

    if (filtroCampo === "id") {
      return compra.CompraId?.toLowerCase().includes(busqueda);
    } else if (filtroCampo === "proveedor") {
      return compra.ProveedorId?.toLowerCase().includes(busqueda);
    } else if (filtroCampo === "fecha") {
      return formatearFecha(compra.FechaRegistro).includes(busqueda);
    } else if (filtroCampo === "total") {
      return formatPrice(compra.Total).includes(busqueda);
    } else {
      // Búsqueda general
      return (
        compra.CompraId?.toLowerCase().includes(busqueda) ||
        compra.ProveedorId?.toLowerCase().includes(busqueda) ||
        formatearFecha(compra.FechaRegistro).includes(busqueda) ||
        formatPrice(compra.Total).includes(busqueda)
      );
    }
  });

  const [open, setOpen] = useState(false);
  const helpVideos = [
    { key: "create", label: "Crear una compra", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=22._Crear_una_compra_cdpzzl" },
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow"
          >
            <Plus size={18} /> Nueva compra
          </button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar compra..."
                value={filtroText}
                onChange={(e) => setFiltroText(e.target.value)}
                className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={filtroCampo}
              onChange={(e) => {
                setFiltroCampo(e.target.value);
                if (!e.target.value) setFiltroText("");
              }}
              className="border rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Filtrar por campo</option>
              <option value="id">ID Compra</option>
              <option value="proveedor">ID Proveedor</option>
              <option value="fecha">Fecha</option>
              <option value="total">Total</option>
            </select>

            <button
              onClick={() => setOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
            >
              ?
            </button>
            <HelpModal
              isOpen={open}
              onClose={() => setOpen(false)}
              videos={helpVideos}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-white">Compra ID</th>
              <th className="px-4 py-3 text-left text-white">Proveedor ID</th>
              <th className="px-4 py-3 text-left text-white">Fecha Registro</th>
              <th className="px-4 py-3 text-center text-white">Total</th>
              <th className="px-4 py-3 text-center text-white">Estado</th>
              <th className="px-4 py-3 text-center text-white">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cargandoDatos ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="text-slate-600 text-base font-medium">Cargando compras...</p>
                  </div>
                </td>
              </tr>
            ) : comprasFiltradas.length > 0 ? (
              comprasFiltradas.map((compra) => {
                const estado = compra.Estado || ESTADOS_COMPRA.APROBADO;
                const config = estadoConfig[estado] || estadoConfig[ESTADOS_COMPRA.APROBADO];

                return (
                  <tr key={compra.CompraId} className="hover:bg-slate-50">
                    <td className="py-4 px-6">{getShortId(compra.CompraId)}</td>
                    <td className="py-4 px-6">{getShortId(compra.ProveedorId)}</td>
                    <td className="py-4 px-6">{formatearFecha(compra.FechaRegistro)}</td>
                    <td className="py-4 px-6 text-center font-medium">
                      {formatPrice(compra.Total)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          <span>{config.label}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => onView(compra)}
                          className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
                          title="Ver detalles"
                        >
                          <Eye size={18} className="text-emerald-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-16 h-16 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 text-lg">No hay compras registradas</p>
                    <p className="text-gray-400 text-sm mt-1">Haz clic en "Nueva compra" para comenzar</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 🔥 PAGINACIÓN - EXACTAMENTE COMO EN CATEGORIAS */}
        {!cargandoDatos && totalItems > 0 && (
          <div className="px-6 py-4 border-t border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ComprasList;