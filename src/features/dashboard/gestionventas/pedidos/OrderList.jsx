import React from "react";
import { Eye, Plus, Search, Trash2 } from "lucide-react"; // Trash2 se queda importado pero no se usa
import { Pagination } from "../../components/paginacion/pagination";
import { formatDate, shortenId, formatPrice } from "../../gestionventas/pedidos/utils/pedidosHelpers";

export const OrderList = ({
  paginatedData,
  busqueda,
  setBusqueda,
  campoFiltro,
  setCampoFiltro,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  handlePageChange,
  handleItemsPerPageChange,
  goToCreate,
  goToView
  // Eliminado handleDelete
}) => {
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button
            onClick={goToCreate}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap text-sm"
          >
            <Plus size={18} /> Nuevo pedido
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar pedidos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            />
          </div>
          <select
            value={campoFiltro}
            onChange={(e) => setCampoFiltro(e.target.value)}
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Acciones</th> {/* Se mantiene igual */}
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
                  <td className="px-6 py-4 text-sm font-medium">{formatPrice(pedido.Total)}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium capitalize">
                      {pedido.MetodoPago?.replace('_', ' ') || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pedido.Estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      pedido.Estado === 'aprobado' ? 'bg-blue-100 text-blue-800' :
                      pedido.Estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {pedido.Estado === 'pendiente' ? 'Pendiente' :
                       pedido.Estado === 'aprobado' ? 'Aprobado' :
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
                    {/* Eliminado el botón de eliminar */}
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