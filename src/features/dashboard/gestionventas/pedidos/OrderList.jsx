import React, { useState, useEffect } from "react";
import { Eye, Plus, Search } from "lucide-react";
import { Pagination } from "../../components/paginacion/pagination";
import { formatDate, shortenId, formatPrice } from "../pedidos/utils/pedidosHelpers";

export const OrderList = ({
  paginatedData,
  filtroText,
  setFiltroText,
  filtroCampo,
  setFiltroCampo,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  handlePageChange,
  handleItemsPerPageChange,
  goToCreate,
  goToView,
  tipoPago
}) => {
  // Estado local para el input de búsqueda
  const [localSearchText, setLocalSearchText] = useState(filtroText);

  // Sincronizar el estado local cuando cambia el filtroText desde fuera
  useEffect(() => {
    setLocalSearchText(filtroText);
  }, [filtroText]);

  // Debounce: actualizar el filtroText del padre después de 500ms sin escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchText !== filtroText) {
        setFiltroText(localSearchText);
        // Resetear a página 1 cuando se hace una nueva búsqueda
        if (currentPage !== 1) {
          handlePageChange(1);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchText, filtroText, setFiltroText, currentPage, handlePageChange]);

  // Manejar cambio en el input SIN perder foco
  const handleSearchChange = (e) => {
    setLocalSearchText(e.target.value);
  };

  // Manejar búsqueda inmediata con Enter
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setFiltroText(localSearchText);
      if (currentPage !== 1) {
        handlePageChange(1);
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button
            onClick={goToCreate}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow"

          >
            <Plus size={18} /> Nuevo pedido
          </button>

          {/* Selector de tipo de pago */}
          {tipoPago && (
            <select
              value={filtroCampo === 'MetodoPago' ? filtroText : ''}
              onChange={(e) => {
                setFiltroCampo('MetodoPago');
                setFiltroText(e.target.value);
                if (currentPage !== 1) {
                  handlePageChange(1);
                }
              }}
              className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
            >
              <option value="">Todos los métodos</option>
              <option value="transferencia">Transferencia</option>
              <option value="contra_entrega">Contra Entrega</option>
            </select>
          )}

          {/* Input de búsqueda con estado local */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar pedidos..."
              value={localSearchText}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            />
          </div>

          {/* Selector de campo de filtro */}
          <select
            value={filtroCampo}
            onChange={(e) => {
              setFiltroCampo(e.target.value);
              if (currentPage !== 1) {
                handlePageChange(1);
              }
            }}
            className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          >
            <option value="">Filtrar por Campo</option>
            <option value="PedidoClienteId">Pedido ID</option>
            <option value="NombreCliente">Cliente</option>
            <option value="FechaRegistro">Fecha</option>
            <option value="MetodoPago">Método Pago</option>
            <option value="Estado">Estado</option>
          </select>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Cliente</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Fecha</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Total</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Método</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Estado</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.isArray(paginatedData) && paginatedData.length > 0 ? (
              paginatedData.map((pedido) => (
                <tr key={pedido.PedidoClienteId} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-700 font-mono font-bold">
                    {shortenId(pedido.PedidoClienteId)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {pedido.ClienteNombre || pedido.NombreCliente ||
                      (pedido.TipoCliente === 'walkin' ? 'Cliente Walk-in' : '—')}
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDate(pedido.FechaRegistro)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">
                    {formatPrice(pedido.Total)} 
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium capitalize">
                      {pedido.MetodoPago?.replace('_', ' ') || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pedido.Estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      pedido.Estado === 'aprobado' ? 'bg-blue-100 text-blue-800' :
                      pedido.Estado === 'finalizado' ? 'bg-green-100 text-green-800' :
                      pedido.Estado === 'en_proceso' ? 'bg-purple-100 text-purple-800' :
                      pedido.Estado === 'en_camino' ? 'bg-orange-100 text-orange-800' :
                      pedido.Estado === 'entregado' ? 'bg-emerald-100 text-emerald-800' :
                      pedido.Estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {pedido.Estado === 'pendiente' ? 'Pendiente' :
                       pedido.Estado === 'aprobado' ? 'Aprobado' :
                       pedido.Estado === 'finalizado' ? 'Finalizado' :
                       pedido.Estado === 'en_proceso' ? 'En Proceso' :
                       pedido.Estado === 'en_camino' ? 'En Camino' :
                       pedido.Estado === 'entregado' ? 'Entregado' :
                       pedido.Estado === 'cancelado' ? 'Cancelado' :
                       pedido.Estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => goToView(pedido)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Ver detalle"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                  No hay pedidos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Paginación */}
        {paginatedData.length > 0 && (
          <div className="px-6 py-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>
    </>
  );
};