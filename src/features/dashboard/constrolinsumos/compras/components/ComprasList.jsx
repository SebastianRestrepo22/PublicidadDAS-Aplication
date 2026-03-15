import React, { useState, useEffect } from "react";
import { Eye, Plus, Search, Clock, XCircle } from "lucide-react";
import { Pagination } from "../../../components/paginacion/pagination";
import { ESTADOS_COMPRA } from "../hook/useCompras";
import { CancelacionModal } from "../../../components/modals/CancelacionModal";

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
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
};

// 🔥 MODIFICADO: Calcular minutos restantes para anulación automática (2 horas = 120 min)
const calcularMinutosRestantes = (fechaRegistro) => {
  if (!fechaRegistro) return null;

  const fechaCompra = new Date(fechaRegistro);
  const ahora = new Date();

  // 🔥 Calcular la fecha límite: 2 horas después de la compra
  const fechaLimite = new Date(fechaCompra);
  fechaLimite.setHours(fechaLimite.getHours() + 2);

  // Si ya pasó la fecha límite
  if (ahora > fechaLimite) return 0;

  // Calcular minutos restantes
  const diffMs = fechaLimite - ahora;
  const diffMinutos = Math.floor(diffMs / 60000);

  return diffMinutos;
};

// Formatear minutos para mostrar
const formatearMinutosRestantes = (minutos) => {
  if (minutos === null) return '';
  if (minutos <= 0) return '0 min';
  if (minutos < 60) return `${minutos} min`;

  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
};

// Configuración de estados
const estadoConfig = {
  [ESTADOS_COMPRA.PENDIENTE]: {
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Pendiente',
    icon: Clock
  },
  [ESTADOS_COMPRA.RECIBIDO]: {
    color: 'bg-green-100 text-green-800',
    label: 'Recibido',
    icon: '✅'
  },
  [ESTADOS_COMPRA.ANULADA]: {
    color: 'bg-red-100 text-red-800',
    label: 'Anulada',
    icon: '❌'
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
  onActualizarEstado,
  onRefresh,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange
}) => {
  const [tiempoActual, setTiempoActual] = useState(new Date());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempoActual(new Date());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  const handleCancelClick = (compra) => {
    setCompraSeleccionada(compra);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async (motivo) => {
    if (compraSeleccionada && onActualizarEstado) {
      setCancelando(true);
      try {
        await onActualizarEstado(compraSeleccionada.CompraId, ESTADOS_COMPRA.ANULADA, null, motivo);
        if (onRefresh) await onRefresh();
        setTimeout(() => {
          setShowCancelModal(false);
          setCompraSeleccionada(null);
        }, 500);
      } catch (error) {
        console.error("Error al cancelar compra:", error);
      } finally {
        setCancelando(false);
      }
    } else {
      setShowCancelModal(false);
      setCompraSeleccionada(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
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
              onChange={(e) => setFiltroCampo(e.target.value)}
              className="border rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Filtrar por campo</option>
              <option value="id">ID Compra</option>
              <option value="proveedor">ID Proveedor</option>
              <option value="fecha">Fecha</option>
              <option value="estado">Estado</option>
              <option value="total">Total</option>
            </select>
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
            {paginatedData && paginatedData.length > 0 ? (
              paginatedData.map((compra) => {
                const estado = compra.Estado || ESTADOS_COMPRA.PENDIENTE;
                const config = estadoConfig[estado] || estadoConfig[ESTADOS_COMPRA.PENDIENTE];

                // 🔥 Calcular minutos restantes (2 horas)
                const minutosRestantes = estado === ESTADOS_COMPRA.PENDIENTE
                  ? calcularMinutosRestantes(compra.FechaRegistro)
                  : null;

                // Determinar si está por expirar (menos de 10 minutos)
                const porExpirar = minutosRestantes !== null && minutosRestantes <= 10 && minutosRestantes > 0;

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
                          <span>{typeof config.icon === 'string' ? config.icon : <config.icon size={14} />}</span>
                          <span>{config.label}</span>
                        </span>

                        {estado === ESTADOS_COMPRA.PENDIENTE && minutosRestantes !== null && minutosRestantes > 0 && (
                          <span className={`text-xs font-medium ${porExpirar ? 'text-red-600 animate-pulse' : 'text-gray-500'}`}>
                            {formatearMinutosRestantes(minutosRestantes)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => onView(compra)}
                          className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
                          title="Ver detalles"
                          disabled={cancelando}
                        >
                          <Eye size={18} className="text-emerald-600" />
                        </button>

                        {estado === ESTADOS_COMPRA.PENDIENTE && (
                          <button
                            onClick={() => handleCancelClick(compra)}
                            className="p-2 hover:bg-red-50 rounded-full transition-colors"
                            title="Cancelar compra"
                            disabled={cancelando}
                          >
                            <XCircle size={18} className={`text-red-500 ${cancelando ? 'opacity-50' : ''}`} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  {paginatedData === undefined ? "Cargando compras..." : "No hay compras a mostrar"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {paginatedData && paginatedData.length > 0 && (
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

      {/* Modal de cancelación */}
      <CancelacionModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCompraSeleccionada(null);
        }}
        onConfirm={handleConfirmCancel}
        pedidoId={compraSeleccionada?.CompraId || ''}
      />
    </>
  );
};