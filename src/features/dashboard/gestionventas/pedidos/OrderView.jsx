import React, { useState } from "react";
import {
  ArrowLeft, Package, User, CreditCard,
  Calendar, Phone, MapPin, FileText,
  CheckCircle, XCircle, Clock, Truck,
  AlertCircle, Edit, Download, Printer, X
} from "lucide-react";
import { toast } from "react-toastify";
import { formatDate, formatPrice, shortenId } from "../pedidos/utils/pedidosHelpers";

export const OrderView = ({
  selectedPedido,
  productos,
  servicios,
  colores,
  onBack,
  onEdit,
  onUpdateEstado,
  userRole = "admin"
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Determinar si el pedido viene de la landing page
  const esPedidoLanding = selectedPedido?.Origen === 'landing' || selectedPedido?.EsLanding === true;

  // Determinar el tipo de pago
  const esContraEntrega = selectedPedido?.MetodoPago === 'contra_entrega';

  // 🔥 ESTADOS PERMITIDOS SEGÚN MÉTODO DE PAGO
  const getEstadosPermitidos = () => {
    if (esContraEntrega) {
      // Estados para contra entrega: flujo completo de envío
      return ['pendiente', 'en_proceso', 'en_camino', 'entregado', 'cancelado'];
    } else {
      // Estados para transferencia/QR: solo aprobado y cancelado
      return ['pendiente', 'aprobado', 'cancelado'];
    }
  };

  const estadosPermitidos = getEstadosPermitidos();

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprobado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_proceso': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'en_camino': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'entregado': return 'bg-green-100 text-green-800 border-green-200';
      case 'finalizado': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return <Clock className="w-4 h-4" />;
      case 'aprobado': return <CheckCircle className="w-4 h-4" />;
      case 'en_proceso': return <Package className="w-4 h-4" />;
      case 'en_camino': return <Truck className="w-4 h-4" />;
      case 'entregado': return <CheckCircle className="w-4 h-4" />;
      case 'finalizado': return <CheckCircle className="w-4 h-4" />;
      case 'cancelado': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      en_proceso: 'En Proceso',
      en_camino: 'En Camino',
      entregado: 'Entregado',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado'
    };
    return labels[estado] || estado;
  };

  // 🔥 VERIFICAR SI EL ESTADO ES ACCESIBLE (no retroceder)
  const ordenEstados = {
    'pendiente': 1,
    'aprobado': 2,
    'en_proceso': 2,
    'en_camino': 3,
    'entregado': 4,
    'finalizado': 3,
    'cancelado': 999
  };

  const isEstadoAccesible = (estado) => {
    if (estado === 'cancelado') return true;
    
    const estadoActual = selectedPedido?.Estado;
    if (!estadoActual) return true;
    
    const nivelActual = ordenEstados[estadoActual];
    const nivelEstado = ordenEstados[estado];
    
    if (!nivelActual || !nivelEstado) return true;
    
    return nivelEstado >= nivelActual;
  };

  const getEstadoTooltip = (estado) => {
    if (!isEstadoAccesible(estado)) {
      return `No puedes cambiar de "${getEstadoLabel(selectedPedido.Estado)}" a "${getEstadoLabel(estado)}". Solo puedes avanzar a estados posteriores.`;
    }
    return `Cambiar estado a ${getEstadoLabel(estado)}`;
  };

  const handleEstadoChange = async (nuevoEstado) => {
    if (nuevoEstado === 'cancelado') {
      setShowCancelModal(true);
      return;
    }

    if (!isEstadoAccesible(nuevoEstado)) {
      toast.warning(`No puedes cambiar de "${getEstadoLabel(selectedPedido.Estado)}" a "${getEstadoLabel(nuevoEstado)}"`);
      return;
    }

    try {
      setUpdating(true);
      await onUpdateEstado(nuevoEstado);
      
      let mensaje = `Estado actualizado a ${getEstadoLabel(nuevoEstado)}`;
      
      // Mensaje especial para cuando se aprueba un pedido (genera venta)
      if (!esContraEntrega && nuevoEstado === 'aprobado') {
        mensaje = '✅ Pedido aprobado - Se generó la venta automáticamente';
      }
      
      // Mensaje especial para cuando se entrega un pedido de contra entrega
      if (esContraEntrega && nuevoEstado === 'entregado') {
        mensaje = '✅ Pedido entregado - Se generó la venta automáticamente';
      }
      
      toast.success(mensaje);
      
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      toast.warning('Debes proporcionar un motivo de cancelación');
      return;
    }

    try {
      setUpdating(true);
      await onUpdateEstado('cancelado', cancelReason);
      setShowCancelModal(false);
      setCancelReason("");
      toast.success('Pedido cancelado correctamente');
      
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error) {
      toast.error('Error al cancelar el pedido');
    } finally {
      setUpdating(false);
    }
  };

  // Obtener nombre del producto/servicio
  const getItemNombre = (item) => {
    if (item.ProductoId) {
      const producto = productos.find(p => p.ProductoId === item.ProductoId);
      return producto?.Nombre || item.ProductoNombre || 'Producto';
    }
    if (item.ServicioId) {
      const servicio = servicios.find(s => s.ServicioId === item.ServicioId);
      return servicio?.Nombre || item.ServicioNombre || 'Servicio';
    }
    return item.Nombre || 'Item';
  };

  // Obtener color del item
  const getItemColor = (item) => {
    if (!item.ColorId) return null;
    const color = colores.find(c => c.ColorId === item.ColorId);
    return color || (item.ColorNombre ? { Nombre: item.ColorNombre, Hex: item.ColorHex } : null);
  };

  // Determinar si el voucher es una imagen
  const esImagen = (url) => {
    if (!url) return false;
    const extension = url.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-lg font-bold text-slate-800">Detalle del Pedido</h3>
        
        {/* Botón de editar - Solo para pedidos de admin en estado pendiente */}
        {!esPedidoLanding && selectedPedido.Estado === 'pendiente' && (
          <button
            onClick={() => onEdit(selectedPedido)}
            className="ml-auto p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
            title="Editar pedido"
          >
            <Edit size={18} />
          </button>
        )}
        
        {/* Badge de origen para pedidos de landing */}
        {esPedidoLanding && (
          <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            Pedido Web
          </span>
        )}
        
        <span className="ml-2 text-sm text-slate-500 font-mono">
          ID: {shortenId(selectedPedido.PedidoClienteId)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Información del pedido */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estado del pedido */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
              <Package size={20} /> Estado del Pedido
            </h4>
            
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 ${getEstadoColor(selectedPedido.Estado)}`}>
                {getEstadoIcon(selectedPedido.Estado)}
                {getEstadoLabel(selectedPedido.Estado)}
              </span>
              <span className="text-sm text-slate-500">
                Fecha: {formatDate(selectedPedido.FechaRegistro)}
              </span>
            </div>

            {/* Indicador del tipo de pago */}
            <div className="mb-3 text-sm">
              {esContraEntrega ? (
                <span className="text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <Truck size={14} />
                  Contra Entrega - Se generará venta al entregar
                </span>
              ) : (
                <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <Clock size={14} />
                  Transferencia - Pendiente de aprobación
                </span>
              )}
            </div>

            {userRole === 'admin' && !esPedidoLanding && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Cambiar estado:
                </p>
                <div className="flex flex-wrap gap-2">
                  {estadosPermitidos.map((estado) => {
                    const accesible = isEstadoAccesible(estado);
                    const esActual = estado === selectedPedido.Estado;
                    
                    return (
                      <button
                        key={estado}
                        onClick={() => accesible && handleEstadoChange(estado)}
                        disabled={updating || esActual || !accesible}
                        title={getEstadoTooltip(estado)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                          esActual
                            ? getEstadoColor(estado)
                            : accesible
                              ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
                              : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {getEstadoLabel(estado)}
                        {!accesible && !esActual && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 rounded-full"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Mensaje informativo sobre estados no disponibles */}
                {estadosPermitidos.some(e => !isEstadoAccesible(e) && e !== selectedPedido.Estado) && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Los estados atenuados no están disponibles porque son anteriores al estado actual.
                  </p>
                )}
              </div>
            )}

            {/* Mensaje para pedidos de landing (no editables) */}
            {esPedidoLanding && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Los pedidos realizados desde la web no pueden ser modificados.
                  Solo puedes consultar su estado.
                </p>
              </div>
            )}
          </div>

          {/* Productos y Servicios */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
              <Package size={20} /> Productos y Servicios
            </h4>

            <div className="space-y-4">
              {selectedPedido.detalle?.map((item, index) => {
                const color = getItemColor(item);
                const itemNombre = getItemNombre(item);
                const subtotal = (item.Cantidad || 0) * (item.Precio || 0);

                return (
                  <div key={item.DetallePedidoClienteId || index} className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800">{itemNombre}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-slate-600">Cantidad: {item.Cantidad || 1}</span>
                          <span className="text-slate-600">Precio: {formatPrice(item.Precio || 0)}</span>
                          {color && (
                            <div className="flex items-center gap-1">
                              <div 
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color.Hex || color.CodigoHex }}
                              />
                              <span className="text-slate-600">{color.Nombre}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-blue-600">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna derecha - Información adicional */}
        <div className="space-y-6">
          {/* Información del cliente */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
              <User size={20} /> Cliente
            </h4>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Nombre</p>
                <p className="font-medium">{selectedPedido.NombreCliente || selectedPedido.ClienteNombre}</p>
              </div>
              {selectedPedido.ClienteTelefono && (
                <div>
                  <p className="text-sm text-slate-500">Teléfono</p>
                  <p className="font-medium">{selectedPedido.ClienteTelefono}</p>
                </div>
              )}
              {selectedPedido.ClienteCorreo && (
                <div>
                  <p className="text-sm text-slate-500">Correo</p>
                  <p className="font-medium">{selectedPedido.ClienteCorreo}</p>
                </div>
              )}
              {selectedPedido.TipoCliente === 'walkin' && (
                <div className="mt-2">
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                    Cliente Walk-in
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Método de pago */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
              <CreditCard size={20} /> Pago
            </h4>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Método</p>
                <p className="font-medium capitalize">
                  {selectedPedido.MetodoPago === 'transferencia' ? 'Transferencia Bancaria' :
                   selectedPedido.MetodoPago === 'contra_entrega' ? 'Contra Entrega' :
                   selectedPedido.MetodoPago?.replace('_', ' ')}
                </p>
              </div>
              
              {selectedPedido.MetodoPago === 'contra_entrega' && (
                <>
                  {selectedPedido.NombreRecibe && (
                    <div>
                      <p className="text-sm text-slate-500">Recibe</p>
                      <p className="font-medium">{selectedPedido.NombreRecibe}</p>
                    </div>
                  )}
                  {selectedPedido.TelefonoEntrega && (
                    <div>
                      <p className="text-sm text-slate-500">Teléfono</p>
                      <p className="font-medium">{selectedPedido.TelefonoEntrega}</p>
                    </div>
                  )}
                  {selectedPedido.DireccionEntrega && (
                    <div>
                      <p className="text-sm text-slate-500">Dirección</p>
                      <p className="font-medium">{selectedPedido.DireccionEntrega}</p>
                    </div>
                  )}
                </>
              )}

              {selectedPedido.Voucher && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Comprobante</p>
                  <button
                    onClick={() => setShowVoucherModal(true)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <FileText size={16} />
                    Ver voucher
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h4 className="text-lg font-semibold mb-4 text-blue-700">Resumen</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Subtotal</span>
                <span className="font-medium">{formatPrice(selectedPedido.Total)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
                <span>Total</span>
                <span className="text-blue-700">{formatPrice(selectedPedido.Total)}</span>
              </div>
            </div>
          </div>

          {/* Mensajes informativos según estado */}
          {selectedPedido.Estado === 'aprobado' && !esContraEntrega && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <CheckCircle size={16} />
                ✅ Pedido aprobado - Venta generada automáticamente
              </p>
            </div>
          )}

          {esContraEntrega && selectedPedido.Estado === 'entregado' && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <CheckCircle size={16} />
                ✅ Pedido entregado - Venta generada automáticamente
              </p>
            </div>
          )}

          {selectedPedido.Estado === 'pendiente' && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <Clock size={16} />
                ⏳ Pedido pendiente de confirmación.
              </p>
            </div>
          )}

          {esContraEntrega && selectedPedido.Estado === 'en_proceso' && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 flex items-center gap-2">
                <Package size={16} />
                📦 Pedido en proceso de preparación.
              </p>
            </div>
          )}

          {esContraEntrega && selectedPedido.Estado === 'en_camino' && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-700 flex items-center gap-2">
                <Truck size={16} />
                🚚 Pedido en camino hacia tu dirección.
              </p>
            </div>
          )}

          {selectedPedido.Estado === 'cancelado' && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <XCircle size={16} />
                ❌ Pedido cancelado
                {selectedPedido.MotivoCancelacion && (
                  <span className="block mt-1 text-xs">
                    Motivo: {selectedPedido.MotivoCancelacion}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Cancelar Pedido</h3>
            <p className="text-sm text-slate-600 mb-4">
              ¿Estás seguro de cancelar este pedido? Esta acción no se puede deshacer.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Motivo de cancelación (obligatorio)"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCancelConfirm}
                disabled={updating}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {updating ? 'Cancelando...' : 'Confirmar cancelación'}
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de voucher */}
      {showVoucherModal && selectedPedido.Voucher && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-slate-800">Comprobante de Pago</h3>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              {esImagen(selectedPedido.Voucher) ? (
                <div className="flex justify-center">
                  <img 
                    src={selectedPedido.Voucher} 
                    alt="Voucher" 
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <FileText size={64} className="text-blue-500 mb-4" />
                  <p className="text-slate-600 mb-4">No se puede previsualizar este archivo</p>
                  <a
                    href={selectedPedido.Voucher}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                  >
                    <Download size={16} />
                    Descargar archivo
                  </a>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowVoucherModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};