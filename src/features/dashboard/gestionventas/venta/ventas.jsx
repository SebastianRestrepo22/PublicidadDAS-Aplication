import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, ArrowLeft, Search, X, AlertCircle, FileText, DollarSign, User, Package, Plus, Download, Printer, ShoppingBag } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from "../../components/paginacion/pagination.jsx";
import { TiempoRestanteAnulacion } from '../venta/components/TiempoRestanteAnulacion.jsx';
import { getVentas, getVentaById, anularVenta, actualizarEstadoVenta, rechazarVenta  } from "../venta/services/service.ventas.js";
import Modal from "../../components/modals/modal.jsx";
import { generarFacturaPDF } from "../../../../utils/generarFacturaPDF.js";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
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
    // Formato colombiano: puntos como separador de miles, sin decimales
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

const DetallesProductosAcordeon = ({ detalles }) => {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

  // Validación más robusta
  if (!detalles) {
    console.warn('DetallesProductosAcordeon: detalles es null o undefined');
    return <p className="text-gray-500 text-center py-4">No hay información de productos</p>;
  }

  if (!Array.isArray(detalles)) {
    console.warn('DetallesProductosAcordeon: detalles no es un array', detalles);
    return <p className="text-gray-500 text-center py-4">Formato de datos incorrecto</p>;
  }

  // Filtrar elementos nulos del array
  const detallesValidos = detalles.filter(d => d !== null && d !== undefined);

  if (detallesValidos.length === 0) {
    return <p className="text-gray-500 text-center py-4">No hay productos en esta venta</p>;
  }

  const totalProductos = detallesValidos.length;
  const totalCantidad = detallesValidos.reduce((sum, d) => {
    if (!d) return sum;
    const cantidad = d.Cantidad || 0;
    return sum + cantidad;
  }, 0);

  const totalSubtotal = detallesValidos.reduce((sum, d) => {
    if (!d) return sum;
    let subtotal = 0;
    if (d.Subtotal !== undefined && d.Subtotal !== null) {
      subtotal = typeof d.Subtotal === 'string' ? parseFloat(d.Subtotal) : d.Subtotal;
    }
    return sum + (isNaN(subtotal) ? 0 : subtotal);
  }, 0);

  const totalPaginas = Math.ceil(detallesValidos.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const detallesPaginados = detallesValidos.slice(inicio, inicio + itemsPorPagina);

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setMostrarDetalles(!mostrarDetalles)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-wrap">
            <h4 className="font-semibold text-blue-800 flex items-center gap-1 text-sm">
              <Package size={14} />Detalle ({totalProductos} items)
            </h4>
            <div className="flex gap-3 text-xs">
              <span className="bg-white px-2 py-1 rounded shadow-sm">
                <span className="text-gray-600">Unidades:</span>
                <span className="font-bold ml-1">{totalCantidad}</span>
              </span>
              <span className="bg-white px-2 py-1 rounded shadow-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold ml-1 text-blue-600">{formatPrice(totalSubtotal)}</span>
              </span>
            </div>
          </div>
          <button className="p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50">
            {mostrarDetalles ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {mostrarDetalles && (
        <div className="border rounded-lg overflow-hidden shadow-sm text-sm">
          <div className="bg-gray-100 p-2 border-b grid grid-cols-12 text-xs font-medium text-gray-700">
            <div className="col-span-6">Producto/Servicio</div>
            <div className="col-span-1 text-center">Tipo</div>
            <div className="col-span-1 text-center">Cant.</div>
            <div className="col-span-2 text-right">P.Unit</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y">
            {detallesPaginados.map((item, index) => {
              if (!item) return null;

              return (
                <div key={item.DetalleVentaId || index} className="p-2 hover:bg-gray-50 grid grid-cols-12 text-xs items-center">
                  <div className="col-span-6">
                    <div className="font-medium flex items-center gap-1">
                      {item.NombreSnapshot || 'Producto/Servicio'}
                      {item.ColorId && (
                        <span className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.ColorHex || '#ccc' }}></span>
                          <span>{item.ColorNombre || 'Color'}</span>
                        </span>
                      )}
                    </div>
                    {item.DescripcionPersonalizada && (
                      <div className="text-[10px] text-gray-500 italic truncate max-w-[200px]">
                        📝 {item.DescripcionPersonalizada}
                      </div>
                    )}
                  </div>

                  <div className="col-span-1 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${item.TipoItem === 'producto' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                      {item.TipoItem === 'producto' ? 'P' : 'S'}
                    </span>
                  </div>

                  <div className="col-span-1 text-center font-medium">
                    {item.Cantidad || 0}
                  </div>

                  <div className="col-span-2 text-right font-medium">
                    {formatPrice(item.PrecioUnitario)}
                  </div>

                  <div className="col-span-2 text-right font-semibold text-blue-600">
                    {formatPrice(item.Subtotal)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="bg-gray-50 p-3 border-t flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Mostrando {inicio + 1} - {Math.min(inicio + itemsPorPagina, detallesValidos.length)} de {detallesValidos.length} items
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 border rounded hover:bg-white disabled:opacity-50 text-xs"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-xs">
                  {paginaActual} / {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1 border rounded hover:bg-white disabled:opacity-50 text-xs"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-2 border-t text-xs">
            <div className="flex justify-end gap-4">
              <span className="text-gray-600">Total items:</span>
              <span className="font-medium">{totalProductos}</span>
              <span className="text-gray-600 ml-2 font-medium">Total:</span>
              <span className="font-bold text-blue-600">{formatPrice(totalSubtotal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ModalAnular = ({ open, onClose, onConfirm, venta, motivo, setMotivo }) => {
  if (!venta) return null;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[450px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
        <div className="mb-4 flex justify-center"><div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"><AlertCircle size={32} className="text-red-600" /></div></div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">¿Anular esta venta?</h3>
        <p className="text-gray-600 mb-4">Estás a punto de anular la venta <span className="font-semibold">#{shortenId(venta.VentaId)}</span></p>
        <div className="mb-4 text-left">
          <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de anulación *</label>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500" placeholder="Describa brevemente el motivo..." required />
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-sm text-left">
          <p className="font-medium text-yellow-800 mb-1">Esta acción no se puede deshacer</p>
          <p className="text-yellow-700">La venta quedará como <strong>anulada</strong> en el historial.</p>
        </div>
        <div className="flex gap-3">
          <button
            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${!motivo?.trim()
              ? 'bg-red-300 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            onClick={() => onConfirm(venta.VentaId, motivo)}
            disabled={!motivo?.trim()}
          >
            Sí, anular venta
          </button>          <button className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </Modal>
  );
};

const ModalRechazar = ({ open, onClose, onConfirm, venta, motivo, setMotivo }) => {
  if (!venta) return null;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[450px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-orange-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">¿Rechazar esta venta?</h3>
        <p className="text-gray-600 mb-4">
          Estás a punto de rechazar la venta <span className="font-semibold">#{shortenId(venta.VentaId)}</span>
        </p>
        <div className="mb-4 text-left">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo del rechazo *
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Ej: Voucher inválido, comprobante ilegible, falta de pago..."
            required
          />
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6 text-sm text-left">
          <p className="font-medium text-orange-800 mb-1">Esta acción no se puede deshacer</p>
          <p className="text-orange-700">
            La venta quedará como <strong>rechazada</strong> en el historial y se notificará al cliente.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${!motivo?.trim()
              ? 'bg-orange-300 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            onClick={() => onConfirm(venta.VentaId, motivo)}
            disabled={!motivo?.trim()}
          >
            Sí, rechazar venta
          </button>
          <button
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ModalVerVenta = ({ open, onClose, venta, onEstadoActualizado }) => {
  // Estado local para manejar la venta actualizada
  const [ventaLocal, setVentaLocal] = useState(venta);
  // 🔥 NUEVO: Estado para el modal del voucher
  const [openVoucher, setOpenVoucher] = useState(false);

  // Sincronizar cuando cambia la venta externa
  useEffect(() => {
    setVentaLocal(venta);
  }, [venta]);

  if (!ventaLocal) return null;

  const handleDescargarPDF = () => {
    // Solo permitir PDF si está pagado
    if (ventaLocal.Estado !== 'pagado') {
      toast.warning("La factura solo se puede generar cuando la venta está pagada");
      return;
    }
    generarFacturaPDF(ventaLocal);
  };

  // Función para marcar como pagado
  const handleMarcarComoPagado = async () => {
    try {
      const response = await actualizarEstadoVenta(ventaLocal.VentaId, 'pagado');
      if (response.success) {
        toast.success("Venta marcada como pagada");
        setVentaLocal(response.venta);
        if (onEstadoActualizado) {
          onEstadoActualizado(response.venta);
        }
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error(error.error || error.message || "Error al actualizar el estado");
    }
  };

  const vendedorNombre = ventaLocal.UsuarioVendedorNombre || ventaLocal.UsuarioVendedor?.NombreCompleto || 'No especificado';

  // 🔥 NUEVA: Función para determinar tipo de archivo del voucher
  const getVoucherType = (url) => {
    if (!url) return null;
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    return 'other';
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="w-[800px] max-h-[90vh] overflow-y-auto p-6 mx-auto bg-white rounded-xl shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className="text-xl font-bold text-gray-800">Detalles de Venta #{shortenId(ventaLocal.VentaId)}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
          </div>

          <div className="space-y-6">
            {/* Información General */}
            <div className="bg-slate-50 p-5 rounded-xl">
              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><FileText size={16} /> Información General</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><p className="text-xs text-slate-500">ID Venta</p><p className="font-mono text-sm font-medium">{ventaLocal.VentaId}</p></div>
                <div><p className="text-xs text-slate-500">Origen</p><OrigenBadge origen={ventaLocal.Origen} /></div>
                <div><p className="text-xs text-slate-500">Fecha</p><p className="text-sm">{formatDate(ventaLocal.FechaVenta)}</p></div>
                <div><p className="text-xs text-slate-500">Estado</p><EstadoBadge estado={ventaLocal.Estado} /></div>
              </div>

              {/* Botón para marcar como pagado (solo si está pendiente y viene de pedido) */}
              {ventaLocal.Estado === 'pendiente' && ventaLocal.Origen === 'pedido' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800 mb-2">
                        Esta venta está pendiente de verificación de pago
                      </p>
                      <p className="text-xs text-yellow-700 mb-3">
                        Confirma que el pago por transferencia/QR fue recibido para generar la factura.
                      </p>
                      <button
                        onClick={handleMarcarComoPagado}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <DollarSign size={16} /> Marcar como Pagado y Generar Factura
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {ventaLocal.Estado === 'rechazado' && ventaLocal.MotivoRechazo && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs font-medium text-orange-800 mb-1">Motivo de rechazo:</p>
                  <p className="text-sm text-orange-700">{ventaLocal.MotivoRechazo}</p>
                </div>
              )}

              {/* 🔥 MODIFICADO: Sección de Comprobante/Voucher con apertura en modal */}
              {ventaLocal.Voucher && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <FileText size={16} /> Comprobante de Pago
                  </h5>
                  <div className="flex items-center gap-4">
                    {getVoucherType(ventaLocal.Voucher) === 'image' ? (
                      // Preview para imágenes - AHORA ABRE MODAL
                      <div className="flex-1">
                        <img
                          src={ventaLocal.Voucher}
                          alt="Comprobante de pago"
                          className="max-h-48 rounded-lg border border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setOpenVoucher(true)}
                        />
                        <p className="text-xs text-blue-600 mt-2">
                          👆 Haz clic en la imagen para ver más grande
                        </p>
                      </div>
                    ) : getVoucherType(ventaLocal.Voucher) === 'pdf' ? (
                      // Enlace para PDF - AHORA ABRE MODAL
                      <div 
                        className="flex-1 flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded-lg transition-colors"
                        onClick={() => setOpenVoucher(true)}
                      >
                        <div className="p-3 bg-red-100 rounded-lg">
                          <FileText size={24} className="text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Documento PDF</p>
                          <p className="text-blue-600 hover:text-blue-800 text-sm">
                            👆 Haz clic para ver el PDF
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Enlace genérico para otros tipos - TAMBIÉN ABRE MODAL
                      <div 
                        className="flex-1 cursor-pointer hover:bg-blue-100 p-3 rounded-lg transition-colors"
                        onClick={() => setOpenVoucher(true)}
                      >
                        <p className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2">
                          <FileText size={16} />
                          👆 Haz clic para ver el comprobante
                        </p>
                      </div>
                    )}
                    {/* Botón para descargar (sigue funcionando igual) */}
                    <a
                      href={ventaLocal.Voucher}
                      download
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()} // Evita que el click en descargar abra el modal
                    >
                      <Download size={16} /> Descargar
                    </a>
                  </div>
                </div>
              )}

              {ventaLocal.Estado === 'anulado' && ventaLocal.MotivoAnulacion && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-medium text-red-800 mb-1">Motivo de anulación:</p>
                  <p className="text-sm text-red-700">{ventaLocal.MotivoAnulacion}</p>
                </div>
              )}
            </div>

            {/* Cliente */}
            <div className="bg-slate-50 p-5 rounded-xl">
              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><User size={16} /> Cliente</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1"><p className="text-xs text-slate-500">Nombre</p><p className="font-medium">{ventaLocal.ClienteNombre || 'No especificado'}</p></div>
                <div><p className="text-xs text-slate-500">Teléfono</p><p>{ventaLocal.ClienteTelefono || '-'}</p></div>
                <div><p className="text-xs text-slate-500">Correo</p><p className="truncate">{ventaLocal.ClienteCorreo || '-'}</p></div>
              </div>
            </div>

            {/* Vendedor */}
            <div className="bg-slate-50 p-5 rounded-xl">
              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><User size={16} /> Vendedor</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-500">Nombre</p><p className="font-medium">{vendedorNombre}</p></div>
                <div><p className="text-xs text-slate-500">ID Vendedor</p><p className="font-mono text-sm">{ventaLocal.UsuarioVendedorId || '-'}</p></div>
              </div>
            </div>

            {/* Totales */}
            <div className="bg-slate-50 p-5 rounded-xl">
              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><DollarSign size={16} /> Totales</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg border"><p className="text-xs text-slate-500">Subtotal</p><p className="text-lg font-semibold">{formatPrice(ventaLocal.Subtotal)}</p></div>
                <div className="bg-white p-3 rounded-lg border"><p className="text-xs text-slate-500">IVA (19%)</p><p className="text-lg font-semibold">{formatPrice(ventaLocal.IVA)}</p></div>
                <div className="bg-white p-3 rounded-lg border border-blue-200"><p className="text-xs text-blue-600">Total</p><p className="text-xl font-bold text-blue-600">{formatPrice(ventaLocal.Total)}</p></div>
              </div>
            </div>

            {/* Detalles de productos */}
            {ventaLocal.detalle && Array.isArray(ventaLocal.detalle) && ventaLocal.detalle.length > 0 ? (
              <div className="bg-slate-50 p-5 rounded-xl">
                <DetallesProductosAcordeon detalles={ventaLocal.detalle} />
              </div>
            ) : (
              <div className="bg-slate-50 p-5 rounded-xl text-center py-4 text-slate-500">
                No hay detalles disponibles para esta venta
              </div>
            )}
          </div>

          {/* Footer con acciones */}
          <div className="mt-6 pt-4 border-t flex justify-between items-center">
            <button
              onClick={handleDescargarPDF}
              disabled={ventaLocal.Estado !== 'pagado'}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${ventaLocal.Estado === 'pagado'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              title={ventaLocal.Estado !== 'pagado' ? "La factura se habilita cuando la venta está pagada" : ""}
            >
              <Download size={18} />
              {ventaLocal.Estado === 'pagado' ? 'Descargar Factura PDF' : 'Factura no disponible'}
            </button>

            <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* 🔥 NUEVO: Modal para ver el voucher */}
      <ModalVoucher 
        open={openVoucher}
        onClose={() => setOpenVoucher(false)}
        voucherUrl={ventaLocal?.Voucher}
      />
    </>
  );
};

// Puedes agregar esto al final del archivo o en un archivo separado
const ModalVoucher = ({ open, onClose, voucherUrl }) => {
  if (!open || !voucherUrl) return null;

  const getVoucherType = (url) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    return 'other';
  };

  const voucherType = getVoucherType(voucherUrl);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[900px] max-h-[90vh] overflow-hidden p-4 mx-auto bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={20} /> Comprobante de Pago
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido del voucher */}
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          {voucherType === 'image' ? (
            <div className="flex flex-col items-center">
              <img
                src={voucherUrl}
                alt="Comprobante de pago"
                className="max-w-full rounded-lg shadow-lg"
              />
            </div>
          ) : voucherType === 'pdf' ? (
            <iframe
              src={`${voucherUrl}#toolbar=0&navpanes=0`}
              className="w-full h-[70vh] rounded-lg border border-gray-200"
              title="Comprobante PDF"
            />
          ) : (
            <div className="text-center py-12">
              <FileText size={64} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">No se puede previsualizar este tipo de archivo</p>
              <a
                href={voucherUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={18} />
                Descargar archivo
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t flex justify-end gap-3">
          <a
            href={voucherUrl}
            download
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Download size={16} /> Descargar
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const Ventas = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [openVer, setOpenVer] = useState(false);
  const [openAnular, setOpenAnular] = useState(false);
  const [campoFiltro, setCampoFiltro] = useState('');
  const [filtroValor, setFiltroValor] = useState('');
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [openRechazar, setOpenRechazar] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const cargarVentas = async () => {
    setCargando(true);
    try {
      const resultado = await getVentas(currentPage, itemsPerPage, campoFiltro, filtroValor, null, null);
      const data = resultado?.data && Array.isArray(resultado.data) ? resultado.data : [];
      const pagination = resultado?.pagination || {};
      setPaginatedData(data);
      setTotalItems(pagination.totalItems || 0);
      setTotalPages(pagination.totalPages || 1);
      if (currentPage > (pagination.totalPages || 1) && (pagination.totalPages || 0) > 0) setCurrentPage(pagination.totalPages);
    } catch (error) {
      console.error("Error cargando ventas:", error);
      toast.error("Error al cargar las ventas");
      setPaginatedData([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarVentas(); }, [currentPage, itemsPerPage, campoFiltro, filtroValor]);

  const handleVerClick = async (venta) => {
    try {
      console.log('🔍 Venta seleccionada:', venta);
      console.log('🔍 Detalles en venta:', venta.detalle);

      if (venta.detalle && venta.detalle.length > 0) {
        console.log('✅ Usando detalles existentes:', venta.detalle.length);
        setVentaSeleccionada(venta);
      } else {
        console.log('🔄 Obteniendo detalles del backend para:', venta.VentaId);
        const ventaCompleta = await getVentaById(venta.VentaId);
        console.log('📦 Venta completa recibida:', ventaCompleta);
        console.log('📦 Detalles en venta completa:', ventaCompleta?.detalle);

        // Verificar si ventaCompleta tiene la estructura correcta
        if (!ventaCompleta) {
          console.error('❌ No se recibió data del backend');
          toast.error('No se pudo obtener la información de la venta');
          return;
        }

        // Asegurar que detalle sea un array
        if (ventaCompleta.detalle && !Array.isArray(ventaCompleta.detalle)) {
          console.warn('⚠️ detalle no es un array, convirtiendo...');
          ventaCompleta.detalle = [ventaCompleta.detalle];
        }

        setVentaSeleccionada(ventaCompleta);
      }
      setOpenVer(true);
    } catch (error) {
      console.error("❌ Error al cargar venta:", error);
      toast.error("Error al cargar los detalles de la venta");
    }
  };

  const handleAnularClick = (venta) => {
    setVentaSeleccionada(venta);
    setMotivoAnulacion('');
    setOpenAnular(true);
  };

  const handleRechazarClick = (venta) => {
    setVentaSeleccionada(venta);
    setMotivoRechazo('');
    setOpenRechazar(true);
  };

  const handleConfirmarRechazar = async (ventaId, motivo) => {
    try {
      const response = await rechazarVenta(ventaId, motivo);
      if (response.success) {
        toast.success("Venta rechazada correctamente");
        setOpenRechazar(false);
        setOpenVer(false);
        await cargarVentas();
      } else {
        toast.error(response.message || "Error al rechazar la venta");
      }
    } catch (error) {
      console.error("Error al rechazar venta:", error);
      toast.error(error.response?.data?.error || "Error al rechazar la venta");
    }
  };

  const handleConfirmarAnular = async (ventaId, motivo) => {
    try {
      const response = await anularVenta(ventaId, motivo);
      if (response.success) {
        toast.success("Venta anulada correctamente");
        setOpenAnular(false);
        setOpenVer(false);
        await cargarVentas();
      } else {
        toast.error(response.message || "Error al anular la venta");
      }
    } catch (error) {
      console.error("Error al anular venta:", error);
      toast.error(error.response?.data?.error || "Error al anular la venta");
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (newItemsPerPage) => { setItemsPerPage(newItemsPerPage); setCurrentPage(1); };
  const handleLimpiarFiltros = () => { setCampoFiltro(''); setFiltroValor(''); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Ventas</h1>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button onClick={() => navigate("/dashboard/ventas/crear")} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap text-sm"><Plus size={18} /> Nueva venta</button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                {campoFiltro === "Estado" ? (
                  <select
                    value={filtroValor}
                    onChange={(e) => { setFiltroValor(e.target.value); setCurrentPage(1); }}
                    className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pagado">Pagado</option>
                    <option value="anulado">Anulado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                ) : campoFiltro === "Origen" ? (
                  <select value={filtroValor} onChange={(e) => { setFiltroValor(e.target.value); setCurrentPage(1); }} className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700">
                    <option value="">Todos los orígenes</option><option value="pedido">Desde Pedido</option><option value="manual">Venta Manual</option>
                  </select>
                ) : (
                  <input value={filtroValor} onChange={(e) => setFiltroValor(e.target.value)} type="text" placeholder={campoFiltro ? `Buscar por ${campoFiltro}` : "Seleccione un campo para buscar"} disabled={!campoFiltro} className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 disabled:bg-gray-50 disabled:cursor-not-allowed" />
                )}
              </div>
              <select value={campoFiltro} onChange={(e) => { setCampoFiltro(e.target.value); setFiltroValor(''); }} className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]">
                <option value="">Filtrar por Campo</option><option value="VentaId">ID Venta</option><option value="PedidoClienteId">ID Pedido</option><option value="ClienteNombre">Cliente</option><option value="Estado">Estado</option><option value="Origen">Origen</option>
              </select>
              {(campoFiltro || filtroValor) && <button onClick={handleLimpiarFiltros} className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 whitespace-nowrap"><X size={16} />Limpiar filtros</button>}
            </div>
          </div>
          <ModalVerVenta
            open={openVer}
            onClose={() => setOpenVer(false)}
            venta={ventaSeleccionada}
            // Callback para refrescar la lista cuando se actualiza el estado
            onEstadoActualizado={(ventaActualizada) => {
              // Actualizar la venta en el estado local si está abierta
              if (ventaSeleccionada?.VentaId === ventaActualizada.VentaId) {
                setVentaSeleccionada(ventaActualizada);
              }
              // Recargar la lista para reflejar el cambio en la tabla
              cargarVentas();
            }}
          />
          <ModalAnular open={openAnular} onClose={() => setOpenAnular(false)} onConfirm={handleConfirmarAnular} venta={ventaSeleccionada} motivo={motivoAnulacion} setMotivo={setMotivoAnulacion} />
          <ModalRechazar
            open={openRechazar}
            onClose={() => setOpenRechazar(false)}
            onConfirm={handleConfirmarRechazar}
            venta={ventaSeleccionada}
            motivo={motivoRechazo}
            setMotivo={setMotivoRechazo}
          />
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
                  <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-500"><div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div><p className="mt-2">Cargando ventas...</p></td></tr>
                ) : paginatedData && paginatedData.length > 0 ? (
                  paginatedData.map((venta) => (
                    <tr key={venta.VentaId} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-700 font-mono font-bold">{shortenId(venta.VentaId)}</td>
                      <td className="px-6 py-4 text-sm font-medium"><div>{venta.ClienteNombre || 'Walk-in'}</div>{venta.ClienteTelefono && <div className="text-xs text-slate-500">{venta.ClienteTelefono}</div>}</td>
                      <td className="px-6 py-4 text-sm">{formatDate(venta.FechaVenta)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{formatPrice(venta.Total)}</td>
                      <td className="px-6 py-4 text-sm"><div className="font-medium">{venta.ItemsCount || venta.detalle?.length || 0} items</div>{(venta.ItemsCount || venta.detalle?.length) > 0 && <div className="text-xs text-slate-500">{venta.ProductosCount || 0} prod / {venta.ServiciosCount || 0} serv</div>}</td>
                      <td className="px-6 py-4"><OrigenBadge origen={venta.Origen} /></td>
                      <td className="px-6 py-4"><EstadoBadge estado={venta.Estado} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerClick(venta)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>

                          {/* Botón de rechazar - solo para ventas pendientes */}
                          {venta.Estado === 'pendiente' && (
                            <button
                              onClick={() => handleRechazarClick(venta)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                              title="Rechazar venta (voucher inválido/falta pago)"
                            >
                              <AlertCircle size={18} />
                            </button>
                          )}

                          {venta.Estado === 'pagado' && venta.Origen === 'manual' && (
                            <TiempoRestanteAnulacion
                              fechaVenta={venta.FechaVenta}
                              onAnular={() => handleAnularClick(venta)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-500"><ShoppingBag size={48} className="mx-auto mb-3 text-slate-300" /><p className="text-lg font-medium">No hay ventas registradas</p><p className="text-sm mt-1">{campoFiltro || filtroValor ? "Intenta con otros filtros" : "Las ventas se generan automáticamente desde los pedidos aprobados"}</p></td></tr>
                )}
              </tbody>
            </table>
            {paginatedData && paginatedData.length > 0 && <div className="px-6 py-4 border-t"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} itemsPerPage={itemsPerPage} totalItems={totalItems} onItemsPerPageChange={handleItemsPerPageChange} /></div>}
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Información importante:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Las ventas son registros históricos y <strong>no se pueden eliminar</strong>.</li>
                  <li>Solo se pueden <strong>anular</strong> o <strong>rechazar</strong> en caso de error o pago inválido.</li>
                  <li>Una vez rechazada, la venta queda marcada como "Rechazado" y se notifica al cliente.</li>
                  <li>Las ventas desde pedido se generan automáticamente cuando un pedido es aprobado.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};