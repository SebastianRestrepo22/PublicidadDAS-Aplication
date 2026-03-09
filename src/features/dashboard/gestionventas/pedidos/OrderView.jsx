import React, { useState } from "react";
import {
  ArrowLeft, Edit, Package, FileText,
  ExternalLink, User, Image as ImageIcon,
  ChevronDown, ChevronUp, AlertTriangle, Shield, Store, X
} from "lucide-react";
import { toast } from "react-toastify";
import { CancelacionModal } from "../../components/modals/CancelacionModal";
import {
  formatDate,
  shortenId,
  formatPrice,
  getProductoNombre,
  getColorById
} from "../pedidos/utils/pedidosHelpers";

export const OrderView = ({
  selectedPedido,
  productos,
  servicios,
  colores,
  onBack,
  onEdit,
  onUpdateEstado,
  userRole = 'admin'
}) => {
  const [showVoucher, setShowVoucher] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(selectedPedido?.Estado || 'pendiente');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  if (!selectedPedido) return null;

  const getDetallesFiltrados = () => {
    if (!Array.isArray(selectedPedido.detalle)) return [];
    return selectedPedido.detalle.filter(d => {
      if (filtroTipo === 'todos') return true;
      if (filtroTipo === 'productos') return d.ProductoId && !d.ServicioId;
      if (filtroTipo === 'servicios') return d.ServicioId && !d.ProductoId;
      return true;
    });
  };

  const getConteoTipos = () => {
    if (!Array.isArray(selectedPedido.detalle)) {
      return { productos: 0, servicios: 0, total: 0 };
    }
    const productos = selectedPedido.detalle.filter(d => d.ProductoId && !d.ServicioId).length;
    const servicios = selectedPedido.detalle.filter(d => d.ServicioId && !d.ProductoId).length;
    return { productos, servicios, total: selectedPedido.detalle.length };
  };

  const getItemNombre = (detalle) => {
    if (detalle.ProductoId) {
      return getProductoNombre(detalle.ProductoId, productos, servicios);
    } else if (detalle.ServicioId) {
      const servicio = servicios.find(s => s.ServicioId === detalle.ServicioId);
      return servicio?.Nombre || "Servicio no encontrado";
    }
    return "";
  };

  const getItemDescripcion = (detalle) => {
    // Priorizar la descripción personalizada del detalle
    if (detalle.Descripcion) return detalle.Descripcion;
    
    // Si no, buscar la descripción del producto/servicio
    if (detalle.ProductoId) {
      const producto = productos.find(p => p.ProductoId === detalle.ProductoId);
      return producto?.Descripcion || "";
    } else if (detalle.ServicioId) {
      const servicio = servicios.find(s => s.ServicioId === detalle.ServicioId);
      return servicio?.Descripcion || "";
    }
    return "";
  };

  const getServicioInfo = (servicioId) => {
    return servicios.find(s => s.ServicioId === servicioId);
  };

  // Verificar si la imagen es personalizada (si existe y es diferente de la imagen por defecto)
  const esImagenPersonalizada = (detalle) => {
    if (!detalle.UrlImagen) return false;
    
    // Si es un servicio, comparar con la imagen por defecto
    if (detalle.ServicioId) {
      const servicio = servicios.find(s => s.ServicioId === detalle.ServicioId);
      // Si no hay imagen por defecto o es diferente, es personalizada
      return !servicio?.Imagen || servicio.Imagen !== detalle.UrlImagen;
    }
    return false;
  };

  const abrirComprobante = (voucherUrl) => {
    if (!voucherUrl) {
      toast.error("No hay comprobante disponible");
      return;
    }
    try {
      const urlLimpia = voucherUrl.trim();
      let urlCompleta = urlLimpia.startsWith('http') ? urlLimpia : `http://localhost:3000${urlLimpia.startsWith('/') ? urlLimpia : '/' + urlLimpia}`;
      window.open(urlCompleta, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error("La URL del comprobante no es válida");
    }
  };

  const puedeCancelar = () => selectedPedido.Estado !== 'cancelado' && userRole === 'admin';
  const puedeAprobar = () => userRole === 'admin' && selectedPedido.Estado !== 'aprobado';

  const getOpcionesEstado = () => {
    const opciones = [
      { value: "pendiente", label: "Pendiente", disabled: selectedPedido.Estado === 'aprobado' }
    ];
    if (puedeAprobar()) {
      opciones.push({ value: "aprobado", label: "Aprobado (Generará Venta)", disabled: false });
    }
    if (puedeCancelar()) {
      opciones.push({ value: "cancelado", label: "Cancelar Pedido", disabled: false, className: "text-red-600 font-medium" });
    }
    return opciones;
  };

  const ejecutarCambioEstado = async (nuevoEstado, motivo = "") => {
    setUpdating(true);
    try {
      await onUpdateEstado(nuevoEstado, motivo);
    } catch (error) {
      setEstadoSeleccionado(selectedPedido.Estado);
    } finally {
      setUpdating(false);
      setCancelando(false);
    }
  };

  const handleEstadoChange = async (e) => {
    const nuevoEstado = e.target.value;
    if (nuevoEstado === selectedPedido.Estado) return;
    if (selectedPedido.Estado === 'aprobado' && nuevoEstado === 'pendiente') {
      toast.error("No se puede revertir un pedido aprobado a pendiente");
      setEstadoSeleccionado(selectedPedido.Estado);
      return;
    }
    if (nuevoEstado === 'cancelado' && puedeCancelar()) {
      setShowCancelModal(true);
      return;
    }
    await ejecutarCambioEstado(nuevoEstado);
  };

  const handleConfirmCancel = async (motivo) => {
    setCancelando(true);
    setShowCancelModal(false);
    await ejecutarCambioEstado('cancelado', motivo);
  };

  const conteo = getConteoTipos();
  const detallesFiltrados = getDetallesFiltrados();
  const opcionesEstado = getOpcionesEstado();

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h3 className="text-lg font-bold">Pedido #{shortenId(selectedPedido.PedidoClienteId)}</h3>
              <p className="text-slate-600 text-sm">{formatDate(selectedPedido.FechaRegistro)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              selectedPedido.TipoCliente === 'walkin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {selectedPedido.TipoCliente === 'walkin' ? <><Store size={14} /> Walk-in</> : <><User size={14} /> Registrado</>}
            </div>
            {selectedPedido.TipoCliente === 'walkin' && userRole === 'admin' && (
              <button onClick={() => onEdit(selectedPedido)} className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2">
                <Edit size={18} /> Editar Pedido
              </button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Información General */}
          <div className="bg-slate-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold mb-4">Información General</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-slate-600 mb-1">Cliente</div>
                <div className="font-medium">{selectedPedido.NombreCliente || selectedPedido.ClienteNombre || "Cliente Walk-in"}</div>
                {selectedPedido.ClienteTelefono && (
                  <div className="text-xs text-slate-500 mt-1">{selectedPedido.ClienteTelefono}</div>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-slate-600 mb-1">Estado</div>
                <div className={`font-medium flex items-center gap-1 ${
                  selectedPedido.Estado === 'pendiente' ? 'text-yellow-600' :
                  selectedPedido.Estado === 'aprobado' ? 'text-green-600' :
                  selectedPedido.Estado === 'cancelado' ? 'text-red-600' : 'text-slate-600'
                }`}>
                  {selectedPedido.Estado} {userRole === 'admin' && <Shield size={14} className="ml-1 text-blue-500" />}
                </div>
                {selectedPedido.MotivoCancelacion && (
                  <div className="text-xs text-red-600 mt-1">
                    Motivo: {selectedPedido.MotivoCancelacion}
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-slate-600 mb-1">Método de Pago</div>
                <div className="font-medium capitalize">{selectedPedido.MetodoPago?.replace('_', ' ') || '—'}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-slate-600 mb-1">Total</div>
                <div className="text-lg font-bold text-blue-700">{formatPrice(selectedPedido.Total)}</div>
              </div>
            </div>

            {/* Información de contacto para walk-in o contra entrega */}
            {(selectedPedido.MetodoPago === "contra_entrega" || selectedPedido.TipoCliente === 'walkin') && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedPedido.NombreRecibe && (
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-xs text-slate-600">Nombre quien recibe</div>
                    <div className="font-medium">{selectedPedido.NombreRecibe}</div>
                  </div>
                )}
                {selectedPedido.TelefonoEntrega && (
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-xs text-slate-600">Teléfono</div>
                    <div className="font-medium">{selectedPedido.TelefonoEntrega}</div>
                  </div>
                )}
                {selectedPedido.DireccionEntrega && (
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-xs text-slate-600">Dirección</div>
                    <div className="font-medium text-sm">{selectedPedido.DireccionEntrega}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Voucher */}
          {selectedPedido.MetodoPago === "transferencia" && selectedPedido.Voucher && (
            <div className="bg-slate-50 p-6 rounded-xl">
              <button onClick={() => setShowVoucher(!showVoucher)} className="w-full flex items-center justify-between">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <FileText size={20} /> Comprobante de Pago
                </h4>
                {showVoucher ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showVoucher && (
                <div className="mt-4 bg-white p-4 rounded-lg border">
                  <button 
                    onClick={() => abrirComprobante(selectedPedido.Voucher)} 
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <ExternalLink size={16} /> Ver comprobante
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Detalles */}
          <div className="bg-slate-50 p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between mb-6">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Package size={20} /> Productos y Servicios ({conteo.total} items)
              </h4>
              <div className="flex gap-2 mt-2 sm:mt-0">
                {['todos', 'productos', 'servicios'].map(tipo => (
                  <button
                    key={tipo}
                    onClick={() => setFiltroTipo(tipo)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      filtroTipo === tipo ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)} ({tipo === 'todos' ? conteo.total : tipo === 'productos' ? conteo.productos : conteo.servicios})
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {detallesFiltrados.map((d, index) => {
                const esServicio = !!d.ServicioId;
                const itemNombre = getItemNombre(d);
                const itemDescripcion = getItemDescripcion(d);
                const colorInfo = d.ColorId ? getColorById(d.ColorId, colores) : null;
                const servicioInfo = d.ServicioId ? getServicioInfo(d.ServicioId) : null;
                const imagenPersonalizada = esImagenPersonalizada(d);

                return (
                  <div key={d.DetallePedidoClienteId || index} className="bg-white border rounded-xl p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Imagen del item - USAMOS d.UrlImagen DIRECTAMENTE */}
                      {d.UrlImagen ? (
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <img 
                              src={d.UrlImagen} 
                              alt={itemNombre}
                              className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setImagenAmpliada(d.UrlImagen)}
                              onError={(e) => {
                                console.error("Error cargando imagen:", d.UrlImagen);
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/96?text=Sin+imagen';
                              }}
                            />
                            {imagenPersonalizada && (
                              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                                Cliente
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={32} className="text-slate-400" />
                        </div>
                      )}

                      {/* Información del item */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                esServicio ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {esServicio ? 'Servicio' : 'Producto'}
                              </span>
                              
                              {d.Tamaño && (
                                <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                                  Tamaño: {d.Tamaño}
                                </span>
                              )}
                              
                              {colorInfo && (
                                <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 flex items-center gap-1">
                                  <span 
                                    className="w-3 h-3 rounded-full border"
                                    style={{ backgroundColor: colorInfo.Hex }}
                                  />
                                  {colorInfo.Nombre}
                                </span>
                              )}
                            </div>

                            <div>
                              <h5 className="font-semibold text-lg">{itemNombre}</h5>
                              {/* Mostrar descripción personalizada si existe */}
                              {d.Descripcion && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <p className="text-sm text-blue-800">
                                    <span className="font-medium">Instrucciones del cliente:</span> {d.Descripcion}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Indicador de imagen personalizada */}
                            {imagenPersonalizada && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                                <ImageIcon size={14} />
                                <span>El cliente adjuntó una imagen de referencia</span>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-700">
                              {formatPrice(d.Precio * d.Cantidad)}
                            </div>
                            <div className="text-sm text-slate-500">
                              {d.Cantidad} x {formatPrice(d.Precio)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total del Pedido</span>
                <span className="text-2xl font-bold text-blue-700">{formatPrice(selectedPedido.Total)}</span>
              </div>
            </div>
          </div>

          {/* Estado */}
          {userRole === 'admin' && (
            <div className="bg-slate-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> Actualizar Estado
              </h4>
              {opcionesEstado.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={estadoSeleccionado}
                    onChange={handleEstadoChange}
                    disabled={updating || cancelando || selectedPedido.Estado === 'cancelado'}
                    className="flex-1 px-4 py-3 border rounded-lg"
                  >
                    {opcionesEstado.map(op => (
                      <option key={op.value} value={op.value} disabled={op.disabled} className={op.className}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para imagen ampliada */}
      {imagenAmpliada && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setImagenAmpliada(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={imagenAmpliada} 
              alt="Imagen ampliada" 
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setImagenAmpliada(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <CancelacionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        pedidoId={selectedPedido.PedidoClienteId}
      />
    </>
  );
};