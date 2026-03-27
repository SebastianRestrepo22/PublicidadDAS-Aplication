import React from 'react';
import { Eye, AlertCircle, ShoppingBag } from 'lucide-react';
import { Pagination } from '../../../components/paginacion/pagination.jsx';
import { TiempoRestanteAnulacion } from '../components/TiempoRestanteAnulacion.jsx';

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const safeDateString = typeof dateString === 'string' ? dateString.replace(' ', 'T') : dateString;
  const date = new Date(safeDateString);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const shortenId = (id) => {
  if (!id) return "—";
  const strId = String(id);
  return strId.length > 3 ? strId.slice(-3) : strId.padStart(3, '0');
};

const formatPrice = (value, currency = '$') => {
  if (value === null || value === undefined || value === '') return `${currency}0`;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `${currency}0`;
  return `${currency} ${Math.round(num).toLocaleString('es-CO')}`;
};

const EstadoBadge = ({ estado }) => {
  const config = {
    'pagado': { bg: 'bg-green-100', text: 'text-green-800', label: 'Pagado' },
    'anulado': { bg: 'bg-red-100', text: 'text-red-800', label: 'Anulado' },
    'pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
    'rechazado': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Rechazado' }
  };
  const { bg, text, label } = config[estado] || config['pendiente'];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {estado === 'pendiente' && <AlertCircle size={12} />}
      {estado === 'rechazado' && <AlertCircle size={12} />}
      {label}
    </span>
  );
};

const OrigenBadge = ({ origen }) => {
  const config = {
    'pedido': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Desde Pedido' },
    'manual': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Venta Manual' }
  };
  const { bg, text, label } = config[origen] || config['manual'];
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}>{label}</span>;
};

export const VentasTable = ({
  paginatedData,
  cargando,
  campoFiltro,
  filtroValor,
  onVerClick,
  onRechazarClick,
  onAnularClick,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white">ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Cliente</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Fecha</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Total</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Items</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Origen</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Estado</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {cargando ? (
            <tr>
              <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
                <p className="mt-2">Cargando ventas...</p>
              </td>
            </tr>
          ) : paginatedData && paginatedData.length > 0 ? (
            paginatedData.map((venta) => (
              <tr key={venta.VentaId} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-700 font-mono font-bold">{shortenId(venta.VentaId)}</td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div>{venta.ClienteNombre || 'Walk-in'}</div>
                  {venta.ClienteTelefono && <div className="text-xs text-slate-500">{venta.ClienteTelefono}</div>}
                </td>
                <td className="px-6 py-4 text-sm">{formatDate(venta.FechaVenta)}</td>
                <td className="px-6 py-4 text-sm font-bold text-blue-600">{formatPrice(venta.Total)}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="font-medium">{venta.ItemsCount || venta.detalle?.length || 0} items</div>
                  {(venta.ItemsCount || venta.detalle?.length) > 0 && (
                    <div className="text-xs text-slate-500">{venta.ProductosCount || 0} prod / {venta.ServiciosCount || 0} serv</div>
                  )}
                </td>
                <td className="px-6 py-4"><OrigenBadge origen={venta.Origen} /></td>
                <td className="px-6 py-4"><EstadoBadge estado={venta.Estado} /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onVerClick(venta)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>

                    {venta.Estado === 'pendiente' && (
                      <button
                        onClick={() => onRechazarClick(venta)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                        title="Rechazar venta (voucher inválido/falta pago)"
                      >
                        <AlertCircle size={18} />
                      </button>
                    )}

                    {venta.Estado === 'pagado' && venta.Origen === 'manual' && (
                      <TiempoRestanteAnulacion
                        fechaVenta={venta.FechaVenta}
                        onAnular={() => onAnularClick(venta)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                <ShoppingBag size={48} className="mx-auto mb-3 text-slate-300" />
                <p className="text-lg font-medium">No hay ventas registradas</p>
                <p className="text-sm mt-1">{campoFiltro || filtroValor ? "Intenta con otros filtros" : "Las ventas se generan automáticamente desde los pedidos aprobados"}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {paginatedData && paginatedData.length > 0 && (
        <div className="px-6 py-4 border-t">
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
  );
};