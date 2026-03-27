import React, { useState, useEffect } from 'react';
import { X, FileText, DollarSign, User, Package, Download, AlertCircle } from 'lucide-react';
import Modal from '../../../components/modals/modal.jsx';
import { toast } from 'react-toastify';
import { actualizarEstadoVenta } from '../services/service.ventas.js';
import { generarFacturaPDF } from '../../../../../utils/generarFacturaPDF.js';
import { ModalVoucher } from './ModalVoucher.jsx';

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

const DetallesProductosAcordeon = ({ detalles }) => {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

  if (!detalles) {
    return <p className="text-gray-500 text-center py-4">No hay información de productos</p>;
  }
  if (!Array.isArray(detalles)) {
    return <p className="text-gray-500 text-center py-4">Formato de datos incorrecto</p>;
  }
  const detallesValidos = detalles.filter(d => d !== null && d !== undefined);
  if (detallesValidos.length === 0) {
    return <p className="text-gray-500 text-center py-4">No hay productos en esta venta</p>;
  }

  const totalProductos = detallesValidos.length;
  const totalCantidad = detallesValidos.reduce((sum, d) => sum + (d.Cantidad || 0), 0);
  const totalSubtotal = detallesValidos.reduce((sum, d) => {
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
            {detallesPaginados.map((item, index) => (
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
                <div className="col-span-1 text-center font-medium">{item.Cantidad || 0}</div>
                <div className="col-span-2 text-right font-medium">{formatPrice(item.PrecioUnitario)}</div>
                <div className="col-span-2 text-right font-semibold text-blue-600">{formatPrice(item.Subtotal)}</div>
              </div>
            ))}
          </div>
          {totalPaginas > 1 && (
            <div className="bg-gray-50 p-3 border-t flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Mostrando {inicio + 1} - {Math.min(inicio + itemsPorPagina, detallesValidos.length)} de {detallesValidos.length} items
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="px-3 py-1 border rounded hover:bg-white disabled:opacity-50 text-xs">Anterior</button>
                <span className="px-3 py-1 text-xs">{paginaActual} / {totalPaginas}</span>
                <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} className="px-3 py-1 border rounded hover:bg-white disabled:opacity-50 text-xs">Siguiente</button>
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

export const ModalVerVenta = ({ open, onClose, venta, onEstadoActualizado }) => {
  const [ventaLocal, setVentaLocal] = useState(venta);
  const [openVoucher, setOpenVoucher] = useState(false);

  useEffect(() => {
    setVentaLocal(venta);
  }, [venta]);

  if (!ventaLocal) return null;

  const handleDescargarPDF = () => {
    if (ventaLocal.Estado !== 'pagado') {
      toast.warning("La factura solo se puede generar cuando la venta está pagada");
      return;
    }
    generarFacturaPDF(ventaLocal);
  };

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
                      <button onClick={handleMarcarComoPagado} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2">
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

              {ventaLocal.Voucher && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <FileText size={16} /> Comprobante de Pago
                  </h5>
                  <div className="flex items-center gap-4">
                    {getVoucherType(ventaLocal.Voucher) === 'image' ? (
                      <div className="flex-1">
                        <img src={ventaLocal.Voucher} alt="Comprobante de pago" className="max-h-48 rounded-lg border border-blue-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setOpenVoucher(true)} />
                        <p className="text-xs text-blue-600 mt-2">👆 Haz clic en la imagen para ver más grande</p>
                      </div>
                    ) : getVoucherType(ventaLocal.Voucher) === 'pdf' ? (
                      <div className="flex-1 flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded-lg transition-colors" onClick={() => setOpenVoucher(true)}>
                        <div className="p-3 bg-red-100 rounded-lg"><FileText size={24} className="text-red-600" /></div>
                        <div><p className="text-sm font-medium text-slate-700">Documento PDF</p><p className="text-blue-600 hover:text-blue-800 text-sm">👆 Haz clic para ver el PDF</p></div>
                      </div>
                    ) : (
                      <div className="flex-1 cursor-pointer hover:bg-blue-100 p-3 rounded-lg transition-colors" onClick={() => setOpenVoucher(true)}>
                        <p className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"><FileText size={16} /> 👆 Haz clic para ver el comprobante</p>
                      </div>
                    )}
                    <a href={ventaLocal.Voucher} download className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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

            {/* Detalles productos */}
            {ventaLocal.detalle && Array.isArray(ventaLocal.detalle) && ventaLocal.detalle.length > 0 ? (
              <div className="bg-slate-50 p-5 rounded-xl">
                <DetallesProductosAcordeon detalles={ventaLocal.detalle} />
              </div>
            ) : (
              <div className="bg-slate-50 p-5 rounded-xl text-center py-4 text-slate-500">No hay detalles disponibles para esta venta</div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t flex justify-between items-center">
            <button onClick={handleDescargarPDF} disabled={ventaLocal.Estado !== 'pagado'} className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${ventaLocal.Estado === 'pagado' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} title={ventaLocal.Estado !== 'pagado' ? "La factura se habilita cuando la venta está pagada" : ""}>
              <Download size={18} /> {ventaLocal.Estado === 'pagado' ? 'Descargar Factura PDF' : 'Factura no disponible'}
            </button>
            <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </Modal>

      <ModalVoucher open={openVoucher} onClose={() => setOpenVoucher(false)} voucherUrl={ventaLocal?.Voucher} />
    </>
  );
};