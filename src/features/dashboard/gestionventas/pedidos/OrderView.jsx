import React, { useState } from "react";
import {
  ArrowLeft, Edit, Package, Truck, FileText,
  ExternalLink, Check, User, Calendar, DollarSign,
  ChevronDown, ChevronUp, AlertTriangle, XCircle, Shield, Store
} from "lucide-react";
import { toast } from "react-toastify";
import { CancelacionModal } from "../../components/modals/CancelacionModal";
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
  handleUpdateEstado,
  userRole = 'admin' // Por defecto asumimos admin, pero deberías pasar el rol del usuario actual
}) => {
  const [showVoucher, setShowVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(selectedPedido.Estado);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  
  // Estados para el modal de cancelación
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  // ===== FUNCIÓN PARA FILTRAR DETALLES SEGÚN TIPO =====
  const getDetallesFiltrados = () => {
    if (!Array.isArray(selectedPedido.detalle)) return [];
    
    return selectedPedido.detalle.filter(d => {
      if (filtroTipo === 'todos') return true;
      if (filtroTipo === 'productos') return d.ProductoId && !d.ServicioId;
      if (filtroTipo === 'servicios') return d.ServicioId && !d.ProductoId;
      return true;
    });
  };

  // ===== FUNCIÓN PARA CONTAR PRODUCTOS Y SERVICIOS =====
  const getConteoTipos = () => {
    if (!Array.isArray(selectedPedido.detalle)) {
      return { productos: 0, servicios: 0, total: 0 };
    }
    
    const productos = selectedPedido.detalle.filter(d => d.ProductoId && !d.ServicioId).length;
    const servicios = selectedPedido.detalle.filter(d => d.ServicioId && !d.ProductoId).length;
    
    return {
      productos,
      servicios,
      total: selectedPedido.detalle.length
    };
  };

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

  // ===== DETERMINAR SI EL USUARIO PUEDE CANCELAR =====
  const puedeCancelar = () => {
    // Si el pedido ya está cancelado, no se puede modificar
    if (selectedPedido.Estado === 'cancelado') return false;
    
    // Administrador siempre puede cancelar
    if (userRole === 'admin') return true;
    
    return false;
  };

  // ===== DETERMINAR SI EL USUARIO PUEDE APROBAR =====
  const puedeAprobar = () => {
    // Solo administradores pueden aprobar
    return userRole === 'admin' && selectedPedido.Estado !== 'aprobado';
  };

  // ===== OBTENER OPCIONES DE ESTADO DISPONIBLES =====
  const getOpcionesEstado = () => {
    const opciones = [
      { 
        value: "pendiente", 
        label: "Pendiente", 
        disabled: selectedPedido.Estado === 'aprobado' 
      }
    ];

    // Solo admin puede aprobar
    if (puedeAprobar()) {
      opciones.push({ 
        value: "aprobado", 
        label: "Aprobado (Generará Venta)", 
        disabled: false 
      });
    }

    // Solo admin puede cancelar (si el pedido no está cancelado)
    if (puedeCancelar()) {
      opciones.push({ 
        value: "cancelado", 
        label: "Cancelar Pedido", 
        disabled: false,
        className: "text-red-600 font-medium"
      });
    }

    return opciones;
  };

  // ===== MANEJADOR DE CAMBIO DE ESTADO =====
  const handleEstadoChange = async (e) => {
    const nuevoEstado = e.target.value;
    
    if (nuevoEstado === selectedPedido.Estado) {
      return;
    }

    // Validaciones
    if (selectedPedido.Estado === 'aprobado' && nuevoEstado === 'pendiente') {
      toast.error("No se puede revertir un pedido aprobado a pendiente");
      setEstadoSeleccionado(selectedPedido.Estado);
      return;
    }

    if (selectedPedido.Estado === 'cancelado') {
      toast.error("No se puede modificar un pedido cancelado");
      setEstadoSeleccionado(selectedPedido.Estado);
      return;
    }

    // Si es cancelado y el usuario puede cancelar, abrir modal
    if (nuevoEstado === 'cancelado' && puedeCancelar()) {
      setShowCancelModal(true);
      return;
    }

    // Para otros estados, proceder directamente
    await ejecutarCambioEstado(nuevoEstado);
  };

  // ===== FUNCIÓN PARA EJECUTAR EL CAMBIO DE ESTADO =====
  const ejecutarCambioEstado = async (nuevoEstado, motivo = "") => {
    setUpdating(true);
    try {
      console.log('📝 Cambiando estado de pedido:', {
        id: selectedPedido.PedidoClienteId,
        estadoAnterior: selectedPedido.Estado,
        nuevoEstado,
        motivo: motivo || undefined
      });

      await handleUpdateEstado(nuevoEstado, motivo);
      
    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      setEstadoSeleccionado(selectedPedido.Estado);
    } finally {
      setUpdating(false);
      setCancelando(false);
    }
  };

  // ===== MANEJADOR DE CONFIRMACIÓN DE CANCELACIÓN =====
  const handleConfirmCancel = async (motivo) => {
    setCancelando(true);
    setShowCancelModal(false);
    await ejecutarCambioEstado('cancelado', motivo);
  };

  const conteo = getConteoTipos();
  const detallesFiltrados = getDetallesFiltrados();
  const opcionesEstado = getOpcionesEstado();

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
          {/* Badge de tipo de cliente */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
            selectedPedido.TipoCliente === 'walkin' 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {selectedPedido.TipoCliente === 'walkin' ? (
              <>
                <Store size={14} /> Walk-in
              </>
            ) : (
              <>
                <User size={14} /> Registrado
              </>
            )}
          </div>
          
          {selectedPedido.TipoCliente === 'walkin' && userRole === 'admin' && (
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
            
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Estado</div>
              <div className={`font-medium flex items-center gap-1 ${
                selectedPedido.Estado === 'pendiente' ? 'text-yellow-600' :
                selectedPedido.Estado === 'aprobado' ? 'text-green-600' :
                selectedPedido.Estado === 'cancelado' ? 'text-red-600' :
                'text-slate-600'
              }`}>
                {selectedPedido.Estado === 'pendiente' ? 'Pendiente' :
                 selectedPedido.Estado === 'aprobado' ? 'Aprobado' :
                 selectedPedido.Estado === 'cancelado' ? 'Cancelado' :
                 selectedPedido.Estado}
                {userRole === 'admin' && (
                  <Shield size={14} className="ml-1 text-blue-500" />
                )}
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

        {/* ===== DETALLES DEL PEDIDO CON FILTRO ===== */}
        <div className="bg-slate-50 p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <Package size={20} /> Productos y Servicios
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({conteo.total} items)
              </span>
            </h4>
            
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => setFiltroTipo('todos')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroTipo === 'todos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Todos ({conteo.total})
              </button>
              <button
                onClick={() => setFiltroTipo('productos')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroTipo === 'productos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Productos ({conteo.productos})
              </button>
              <button
                onClick={() => setFiltroTipo('servicios')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroTipo === 'servicios'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Servicios ({conteo.servicios})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {detallesFiltrados.length > 0 ? (
              detallesFiltrados.map((d, index) => (
                <div key={d._tempId || index} className="bg-white border border-slate-200 rounded-xl p-6">
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
                        <h5 className="font-medium">
                          {d.ProductoId ? 'Producto' : 'Servicio'} #{index + 1}
                        </h5>
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
                    {d.ColorId && (
                      <div>
                        <div className="text-sm text-slate-600">Color</div>
                        <div className="font-medium flex items-center gap-2">
                          <div 
                            className="w-5 h-5 rounded-full border" 
                            style={{ backgroundColor: getColorById(d.ColorId, colores)?.CodigoHex }} 
                          />
                          {getColorName(d.ColorId, colores) || "—"}
                        </div>
                      </div>
                    )}
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
              ))
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                No hay {filtroTipo === 'productos' ? 'productos' : filtroTipo === 'servicios' ? 'servicios' : 'items'} para mostrar
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total del Pedido</span>
              <span className="text-2xl font-bold text-blue-700">{formatPrice(selectedPedido.Total)}</span>
            </div>
          </div>
        </div>

        {/* ===== ACTUALIZAR ESTADO ===== */}
        {userRole === 'admin' && (
          <div className="bg-slate-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
              <AlertTriangle size={20} /> Actualizar Estado del Pedido
            </h4>
            
            {selectedPedido.Estado === 'cancelado' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Este pedido fue cancelado: {selectedPedido.MotivoCancelacion || "No se especificó motivo"}
                </p>
              </div>
            )}

            {selectedPedido.Estado === 'aprobado' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Pedido aprobado. No puede volver a estado pendiente.
                </p>
              </div>
            )}

            {opcionesEstado.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nuevo Estado *
                  </label>
                  <select
                    value={estadoSeleccionado}
                    onChange={handleEstadoChange}
                    disabled={updating || cancelando || selectedPedido.Estado === 'cancelado'}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      updating || cancelando ? 'bg-slate-100 cursor-wait' : 'bg-white'
                    } ${selectedPedido.Estado === 'cancelado' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {opcionesEstado.map(opcion => (
                      <option 
                        key={opcion.value} 
                        value={opcion.value} 
                        disabled={opcion.disabled}
                        className={opcion.className}
                      >
                        {opcion.label}
                      </option>
                    ))}
                  </select>
                  {(updating || cancelando) && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></span>
                      {cancelando ? 'Cancelando pedido...' : 'Actualizando...'}
                    </p>
                  )}
                </div>
                
                {selectedPedido.Estado !== 'cancelado' && (
                  <button
                    onClick={() => {
                      if (estadoSeleccionado === 'cancelado') {
                        setShowCancelModal(true);
                      } else if (estadoSeleccionado !== selectedPedido.Estado) {
                        handleEstadoChange({ target: { value: estadoSeleccionado } });
                      }
                    }}
                    disabled={
                      updating || 
                      cancelando || 
                      estadoSeleccionado === selectedPedido.Estado ||
                      selectedPedido.Estado === 'cancelado'
                    }
                    className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                      estadoSeleccionado === 'cancelado'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } ${
                      updating || cancelando || estadoSeleccionado === selectedPedido.Estado
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {updating || cancelando ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        {cancelando ? 'Cancelando...' : 'Guardando...'}
                      </>
                    ) : (
                      <>
                        {estadoSeleccionado === 'cancelado' ? (
                          <>Cancelar Pedido</>
                        ) : (
                          <>Actualizar a {estadoSeleccionado}</>
                        )}
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mensaje para clientes registrados (cuando vean sus pedidos) */}
        {userRole === 'cliente' && selectedPedido.TipoCliente === 'registrado' && (
          <div className="bg-slate-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold mb-4 text-slate-700">Estado del Pedido</h4>
            <div className={`p-4 rounded-lg ${
              selectedPedido.Estado === 'pendiente' ? 'bg-yellow-50 border border-yellow-200' :
              selectedPedido.Estado === 'aprobado' ? 'bg-green-50 border border-green-200' :
              selectedPedido.Estado === 'cancelado' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <p className="flex items-center gap-2">
                <span className={`font-medium ${
                  selectedPedido.Estado === 'pendiente' ? 'text-yellow-800' :
                  selectedPedido.Estado === 'aprobado' ? 'text-green-800' :
                  selectedPedido.Estado === 'cancelado' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  Tu pedido está: {selectedPedido.Estado}
                </span>
              </p>
              {selectedPedido.Estado === 'pendiente' && (
                <p className="text-sm text-yellow-700 mt-2">
                  Puedes cancelar este pedido desde tu panel de cliente si lo deseas.
                </p>
              )}
              {selectedPedido.Estado === 'cancelado' && selectedPedido.MotivoCancelacion && (
                <p className="text-sm text-red-700 mt-2">
                  Motivo: {selectedPedido.MotivoCancelacion}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cancelación */}
      <CancelacionModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setEstadoSeleccionado(selectedPedido.Estado);
        }}
        onConfirm={handleConfirmCancel}
        pedidoId={selectedPedido.PedidoClienteId}
      />
    </div>
  );
};