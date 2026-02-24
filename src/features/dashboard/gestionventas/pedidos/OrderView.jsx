import React, { useState } from "react";
import {
  ArrowLeft, Edit, Package, Truck, FileText,
  ExternalLink, Check, User, Calendar, DollarSign,
  ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "react-toastify";
import {
  formatDate,
  shortenId,
  formatPrice,
  getProductoNombre,
  getColorName,
  getColorById
} from "../pedidos/utils/pedidosHelpers";

export const OrderView = ({
  selectedPedido,
  productos,
  servicios,
  colores,
  goToList,
  goToEdit,
  handleUpdateEstado
}) => {
  const [showVoucher, setShowVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(selectedPedido.Estado);

  // ===== FUNCIÓN PARA ABRIR COMPROBANTE =====
  const abrirComprobante = (voucherUrl) => {
    if (!voucherUrl) {
      toast.error("No hay comprobante disponible");
      return;
    }

    try {
      const urlLimpia = voucherUrl.trim();
      
      let urlCompleta;
      if (urlLimpia.startsWith('http')) {
        urlCompleta = urlLimpia;
      } else {
        const path = urlLimpia.startsWith('/') ? urlLimpia : '/' + urlLimpia;
        urlCompleta = `http://localhost:3000${path}`;
      }
      
      console.log('📎 Abriendo comprobante:', urlCompleta);
      new URL(urlCompleta);
      window.open(urlCompleta, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ Error al abrir comprobante:', error);
      toast.error("La URL del comprobante no es válida");
    }
  };

  // ===== FUNCIÓN PARA CONSTRUIR URL DE IMAGEN =====
  const getVoucherImageUrl = (voucherUrl) => {
    if (!voucherUrl) return '';
    const urlLimpia = voucherUrl.trim();
    if (urlLimpia.startsWith('http')) return urlLimpia;
    const path = urlLimpia.startsWith('/') ? urlLimpia : '/' + urlLimpia;
    return `http://localhost:3000${path}`;
  };

  // ===== MANEJADOR DE ERROR DE IMAGEN =====
  const handleImageError = (e) => {
    console.error('❌ Error cargando imagen del voucher:', e);
    setVoucherError(true);
    e.target.style.display = 'none';
  };

  // ===== MANEJADOR DE CAMBIO DE ESTADO =====
  const handleEstadoChange = async (e) => {
    const nuevoEstado = e.target.value;
    
    if (nuevoEstado === selectedPedido.Estado) {
      return; // No cambió
    }

    setUpdating(true);
    try {
      console.log('📝 Cambiando estado de pedido:', {
        id: selectedPedido.PedidoClienteId,
        estadoAnterior: selectedPedido.Estado,
        nuevoEstado
      });

      // ✅ Llamar a la función que viene del padre (desde PedidosClientes)
      await handleUpdateEstado(nuevoEstado);
      
      // ✅ La función handleUpdateEstado en el padre debe:
      // 1. Actualizar el estado en la BD
      // 2. Si es "aprobado", crear la venta
      // 3. Volver a la lista (goToList)
      
      // Nota: No necesitas hacer nada más aquí porque el padre ya maneja el retorno a la lista
      
    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      toast.error("Error al actualizar el estado");
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goToList}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-lg font-bold">Pedido #{shortenId(selectedPedido.PedidoClienteId)}</h3>
            <p className="text-slate-600 text-sm">{formatDate(selectedPedido.FechaRegistro)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedPedido.TipoCliente === 'walkin' && (
            <button
              onClick={() => goToEdit(selectedPedido)}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Edit size={18} /> Editar Pedido
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* ===== INFORMACIÓN GENERAL ===== */}
        <div className="bg-slate-50 p-6 rounded-xl">
          <h4 className="text-lg font-semibold mb-4 text-slate-700">Información General</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Cliente</div>
              <div className="font-medium">
                {selectedPedido.NombreCliente || selectedPedido.ClienteNombre || "Cliente Walk-in"}
              </div>
            </div>
            
            {/* ===== ESTADO ACTUAL (SOLO VISUALIZACIÓN) ===== */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Estado</div>
              <div className={`font-medium ${
                selectedPedido.Estado === 'pendiente' ? 'text-yellow-600' :
                selectedPedido.Estado === 'aprobado' ? 'text-green-600' :
                selectedPedido.Estado === 'cancelado' ? 'text-red-600' :
                'text-slate-600'
              }`}>
                {selectedPedido.Estado === 'pendiente' ? 'Pendiente' :
                 selectedPedido.Estado === 'aprobado' ? 'Aprobado' :
                 selectedPedido.Estado === 'cancelado' ? 'Cancelado' :
                 selectedPedido.Estado}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Método de Pago</div>
              <div className="font-medium capitalize">
                {selectedPedido.MetodoPago?.replace('_', ' ') || '—'}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Total</div>
              <div className="text-lg font-bold text-blue-700">{formatPrice(selectedPedido.Total)}</div>
            </div>
          </div>
        </div>

        {/* ===== COMPROBANTE DE PAGO ===== */}
        {selectedPedido.MetodoPago === "transferencia" && selectedPedido.Voucher && (
          <div className="bg-slate-50 p-6 rounded-xl">
            <button
              onClick={() => setShowVoucher(!showVoucher)}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <FileText size={20} /> Comprobante de Pago
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Cliente adjuntó
                </span>
              </h4>
              {showVoucher ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
            </button>

            {showVoucher && (
              <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200">
                {selectedPedido.Voucher.toLowerCase().endsWith('.pdf') ? (
                  <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <FileText className="text-red-500" size={48} />
                    <button
                      onClick={() => abrirComprobante(selectedPedido.Voucher)}
                      className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1 px-4 py-2 bg-blue-50 rounded-lg"
                    >
                      <ExternalLink size={14} /> Ver PDF
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    {!voucherError ? (
                      <img
                        src={getVoucherImageUrl(selectedPedido.Voucher)}
                        alt="Comprobante"
                        className="max-w-full max-h-96 rounded-lg border cursor-pointer"
                        onClick={() => abrirComprobante(selectedPedido.Voucher)}
                        onError={handleImageError}
                      />
                    ) : (
                      <button
                        onClick={() => abrirComprobante(selectedPedido.Voucher)}
                        className="text-blue-600 hover:text-blue-800 text-sm px-4 py-2 bg-blue-50 rounded-lg"
                      >
                        <ExternalLink size={14} /> Abrir comprobante
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== DETALLES DEL PEDIDO ===== */}
        <div className="bg-slate-50 p-6 rounded-xl">
          <h4 className="text-lg font-semibold mb-6 text-slate-700 flex items-center gap-2">
            <Package size={20} /> Productos y Servicios
          </h4>
          <div className="space-y-4">
            {Array.isArray(selectedPedido.detalle) && selectedPedido.detalle.map((d, index) => (
              <div key={d._tempId} className="bg-white border border-slate-200 rounded-xl p-6">
                {/* ... contenido de detalles (igual que antes) ... */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    {d.UrlImagen ? (
                      <img src={d.UrlImagen} alt="Producto" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Package size={24} className="text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h5 className="font-medium">Producto #{index + 1}</h5>
                      <p className="text-sm text-slate-600">
                        {getProductoNombre(d.ProductoId || d.ServicioId, productos, servicios)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-700">
                      {formatPrice(d.Precio * d.Cantidad)}
                    </div>
                    <div className="text-sm text-slate-500">
                      {d.Cantidad} x {formatPrice(d.Precio)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-slate-600">Color</div>
                    <div className="font-medium flex items-center gap-2">
                      {d.ColorId && (
                        <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: getColorById(d.ColorId, colores)?.CodigoHex }}></div>
                      )}
                      {getColorName(d.ColorId, colores) || "—"}
                    </div>
                  </div>
                  {d.Tamaño && (
                    <div>
                      <div className="text-sm text-slate-600">Tamaño</div>
                      <div className="font-medium">{d.Tamaño}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-slate-600">Descripción</div>
                    <div className="font-medium">{d.Descripcion || "—"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total del Pedido</span>
              <span className="text-2xl font-bold text-blue-700">{formatPrice(selectedPedido.Total)}</span>
            </div>
          </div>
        </div>

        {/* ===== ACTUALIZAR ESTADO ===== */}
        <div className="bg-slate-50 p-6 rounded-xl">
          <h4 className="text-lg font-semibold mb-4 text-slate-700">Actualizar Estado del Pedido</h4>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">Estado *</label>
              <select
                value={estadoSeleccionado}
                onChange={handleEstadoChange}
                disabled={updating}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  updating ? 'bg-slate-100 cursor-wait' : 'bg-white'
                }`}
              >
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado (Generará Venta)</option>
                <option value="cancelado">Cancelado</option>
              </select>
              {updating && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></span>
                  Actualizando...
                </p>
              )}
            </div>
            <button
              onClick={() => handleEstadoChange({ target: { value: estadoSeleccionado } })}
              disabled={updating || estadoSeleccionado === selectedPedido.Estado}
              className={`bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 ${
                updating || estadoSeleccionado === selectedPedido.Estado ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {updating ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <Check size={18} /> Guardar Cambio
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};