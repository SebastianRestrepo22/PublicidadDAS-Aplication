import React, { useState } from "react";
import {
  ArrowLeft, Package, AlertTriangle,
  Truck, CheckCircle, XCircle, Clock,
  Store, Palette, ChevronDown, ChevronUp,
  Download
} from "lucide-react";
import { toast } from "react-toastify";
import { CancelacionModal } from "../../../components/modals/CancelacionModal";
import { ESTADOS_COMPRA } from "../hook/useCompras";
import { generarFacturaPDF } from "../components/InvoicePDF";

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

// Configuración de estados
const estadoConfig = {
  [ESTADOS_COMPRA.PENDIENTE]: {
    color: 'bg-yellow-100 text-yellow-800',
    borderColor: 'border-yellow-200',
    label: 'Pendiente',
    icon: Clock,
    description: 'Compra registrada, esperando confirmación'
  },
  [ESTADOS_COMPRA.ORDEN_ENVIADA]: {
    color: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-200',
    label: 'Orden Enviada',
    icon: Truck,
    description: 'Orden enviada al proveedor'
  },
  [ESTADOS_COMPRA.RECIBIDO]: {
    color: 'bg-green-100 text-green-800',
    borderColor: 'border-green-200',
    label: 'Recibido',
    icon: CheckCircle,
    description: 'Productos recibidos y stock actualizado'
  },
  [ESTADOS_COMPRA.ANULADA]: {
    color: 'bg-red-100 text-red-800',
    borderColor: 'border-red-200',
    label: 'Anulada',
    icon: XCircle,
    description: 'Compra cancelada'
  }
};

export const ComprasView = ({
  selectedCompra,
  productos,
  colores = [],
  proveedores,
  onBack,
  getProveedorDisplay,
  onActualizarEstado,
  puedeCambiarEstado,
  userRole = 'admin'
}) => {
  console.log("🔵 [ComprasView] selectedCompra recibido:", selectedCompra);
  console.log("🔵 [ComprasView] detalle en selectedCompra:", selectedCompra?.detalle);
  console.log("🔵 [ComprasView] productos disponibles:", productos?.length);

  const [updating, setUpdating] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(selectedCompra?.Estado || ESTADOS_COMPRA.PENDIENTE);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [proximoEstado, setProximoEstado] = useState(null);
  const [detalleExpandido, setDetalleExpandido] = useState({});

  if (!selectedCompra) return null;

  const estadoActual = selectedCompra.Estado || ESTADOS_COMPRA.PENDIENTE;
  const configActual = estadoConfig[estadoActual] || estadoConfig[ESTADOS_COMPRA.PENDIENTE];
  const IconoActual = configActual.icon;

  const puedeCancelar = () =>
    userRole === 'admin' &&
    estadoActual !== ESTADOS_COMPRA.RECIBIDO &&
    estadoActual !== ESTADOS_COMPRA.ANULADA;

  const puedeCambiarA = (estado) => {
    return puedeCambiarEstado(estadoActual, estado);
  };

  const getOpcionesEstado = () => {
    const opciones = [
      {
        value: ESTADOS_COMPRA.PENDIENTE,
        label: "Pendiente",
        disabled: estadoActual === ESTADOS_COMPRA.PENDIENTE || estadoActual === ESTADOS_COMPRA.RECIBIDO || estadoActual === ESTADOS_COMPRA.ANULADA,
        className: "text-yellow-700"
      },
      {
        value: ESTADOS_COMPRA.ORDEN_ENVIADA,
        label: "Orden Enviada",
        disabled: !puedeCambiarA(ESTADOS_COMPRA.ORDEN_ENVIADA),
        className: "text-blue-700"
      },
      {
        value: ESTADOS_COMPRA.RECIBIDO,
        label: "Recibido (Actualizará Stock)",
        disabled: !puedeCambiarA(ESTADOS_COMPRA.RECIBIDO),
        className: "text-green-700"
      },
      {
        value: ESTADOS_COMPRA.ANULADA,
        label: "Cancelar Compra",
        disabled: !puedeCancelar(),
        className: "text-red-700 font-medium"
      }
    ];
    return opciones;
  };

  const ejecutarCambioEstado = async (nuevoEstado, motivo = "") => {
    setUpdating(true);
    try {
      const productosAActualizar = nuevoEstado === ESTADOS_COMPRA.RECIBIDO
        ? selectedCompra.detalle.map(d => ({
            ProductoId: d.ProductoId,
            Cantidad: d.Cantidad,
            colores: d.colores || []
          }))
        : null;

      await onActualizarEstado(selectedCompra.CompraId, nuevoEstado, productosAActualizar, motivo);
      setEstadoSeleccionado(nuevoEstado);
      toast.success(`Estado actualizado a ${estadoConfig[nuevoEstado].label}`);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      setEstadoSeleccionado(estadoActual);
    } finally {
      setUpdating(false);
      setShowConfirmModal(false);
      setProximoEstado(null);
    }
  };

  const handleEstadoChange = async (e) => {
    const nuevoEstado = e.target.value;
    if (nuevoEstado === estadoActual) return;

    if (nuevoEstado === ESTADOS_COMPRA.ANULADA) {
      setShowCancelModal(true);
      return;
    }

    if (nuevoEstado === ESTADOS_COMPRA.RECIBIDO) {
      setProximoEstado(nuevoEstado);
      setShowConfirmModal(true);
      return;
    }

    await ejecutarCambioEstado(nuevoEstado);
  };

  const handleConfirmCancel = async (motivo) => {
    await ejecutarCambioEstado(ESTADOS_COMPRA.ANULADA, motivo);
    setShowCancelModal(false);
  };

  const handleConfirmRecibido = async () => {
    await ejecutarCambioEstado(proximoEstado);
  };

  const toggleDetalle = (index) => {
    setDetalleExpandido(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const opcionesEstado = getOpcionesEstado();
  const conteoItems = selectedCompra.detalle?.length || 0;

  const handleDescargarFactura = () => {
  try {
    console.log("🟡 Datos para factura:", {
      compra: selectedCompra,
      detalles: selectedCompra.detalle,
      proveedor: proveedores.find(p => p.ProveedorId === selectedCompra.ProveedorId)
    });
    
    const proveedor = proveedores.find(p => p.ProveedorId === selectedCompra.ProveedorId);
    generarFacturaPDF(
      selectedCompra,
      selectedCompra.detalle || [],
      proveedor
    );
    toast.success('Factura generada correctamente');
  } catch (error) {
    console.error('🔴 Error detallado al generar factura:', error);
    console.error('🔴 Stack trace:', error.stack);
    toast.error(`Error al generar la factura: ${error.message}`);
  }
};

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-full overflow-hidden">
        {/* Header con botón de descargar factura */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h3 className="text-lg font-bold truncate">Compra #{getShortId(selectedCompra.CompraId)}</h3>
              <p className="text-slate-600 text-xs">{formatearFecha(selectedCompra.FechaRegistro)}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Botón de descargar factura */}
            <button
              onClick={handleDescargarFactura}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Descargar Factura</span>
            </button>
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${configActual.color}`}>
              <IconoActual size={14} />
              <span className="truncate">{configActual.label}</span>
              {userRole === 'admin' && <span className="ml-1 text-[10px] opacity-75">(Admin)</span>}
            </div>
          </div>
        </div>

        {/* Información General */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="text-[10px] text-slate-600 mb-1 flex items-center gap-1">
              <Store size={12} /> Proveedor
            </div>
            <div className="font-medium text-sm truncate">
              {getProveedorDisplay(selectedCompra.ProveedorId, selectedCompra.nombreProveedor)}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="text-[10px] text-slate-600 mb-1">Fecha</div>
            <div className="font-medium text-sm">{formatearFecha(selectedCompra.FechaRegistro)}</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="text-[10px] text-slate-600 mb-1">Estado</div>
            <div className={`font-medium text-sm flex items-center gap-1 ${configActual.color.split(' ')[0]}`}>
              <IconoActual size={12} />
              <span className="truncate">{configActual.label}</span>
            </div>
            {selectedCompra.MotivoCancelacion && (
              <div className="text-[10px] text-red-600 mt-1 truncate">
                Motivo: {selectedCompra.MotivoCancelacion}
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="text-[10px] text-slate-600 mb-1">Total</div>
            <div className="text-base font-bold text-blue-700">{formatPrice(selectedCompra.Total)}</div>
          </div>
        </div>

        {/* Detalles de la Compra */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold flex items-center gap-2">
              <Package size={16} />
              Artículos ({selectedCompra.detalle?.length || 0})
            </h4>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {(selectedCompra.detalle || []).map((d, index) => {
              const producto = productos.find(p => p.ProductoId === d.ProductoId);
              const tieneColores = d.colores && d.colores.length > 0;

              return (
                <div key={d.DetalleCompraId || index} className="bg-slate-50 border rounded-lg p-3">
                  {/* Fila principal del producto */}
                  <div className="flex flex-wrap items-start gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border">
                      <Package size={14} className="text-slate-500" />
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {producto?.Nombre || `Producto ID: ${getShortId(d.ProductoId)}`}
                        </span>
                        {producto?.SKU && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 rounded-full">
                            SKU: {producto.SKU}
                          </span>
                        )}
                      </div>

                      {tieneColores && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block bg-purple-100 text-purple-700">
                          Stock por Color
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-700">
                        {formatPrice(d.Subtotal)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {tieneColores
                          ? `${d.colores.reduce((sum, c) => sum + (c.Stock || 0), 0)} unidades totales`
                          : `${d.Cantidad} x ${formatPrice(d.PrecioUnitario)}`
                        }
                      </div>
                    </div>
                  </div>

                  {/* Detalle de colores */}
                  {tieneColores && (
                    <div className="mt-3 ml-10">
                      <div className="text-xs font-medium text-purple-700 mb-2 flex items-center gap-1">
                        <Palette size={12} />
                        Detalle por colores:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {d.colores.map((color, cIdx) => (
                          <div
                            key={cIdx}
                            className="flex items-center gap-2 text-xs bg-white p-2 rounded-lg border shadow-sm"
                          >
                            <div
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: color.Hex || '#CCCCCC' }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{color.Nombre || 'Color'}</div>
                              <div className="text-green-600 font-semibold">
                                +{color.Stock || 0} unidades
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Descripción adicional */}
                  {d.Descripcion && (
                    <div className="mt-2 text-[10px] text-slate-600 bg-white p-2 rounded border">
                      <span className="font-medium">📝 Nota:</span> {d.Descripcion}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Total de la Compra</span>
              <span className="text-lg font-bold text-blue-700">{formatPrice(selectedCompra.Total)}</span>
            </div>
          </div>
        </div>

        {/* Selector de Estado */}
        {userRole === 'admin' && (
          <div className="bg-slate-50 p-4 rounded-lg border">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle size={14} />
              Actualizar Estado
            </h4>
            {opcionesEstado.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={estadoSeleccionado}
                  onChange={handleEstadoChange}
                  disabled={updating || estadoActual === ESTADOS_COMPRA.RECIBIDO || estadoActual === ESTADOS_COMPRA.ANULADA}
                  className="flex-1 h-9 px-3 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value={estadoActual} disabled>
                    Actual: {configActual.label}
                  </option>
                  {opcionesEstado.map(op => (
                    <option
                      key={op.value}
                      value={op.value}
                      disabled={op.disabled}
                      className={op.className}
                    >
                      {op.label}
                    </option>
                  ))}
                </select>

                {updating && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span>Actualizando...</span>
                  </div>
                )}
              </div>
            )}

            {estadoActual === ESTADOS_COMPRA.RECIBIDO && (
              <p className="mt-2 text-[10px] text-green-600">
                ✓ Stock actualizado
              </p>
            )}
            {estadoActual === ESTADOS_COMPRA.ANULADA && (
              <p className="mt-2 text-[10px] text-red-600">
                ✗ Compra anulada
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmación para Recibido */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-5 max-w-md w-full">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-green-500" size={20} />
              <h3 className="text-base font-bold">Confirmar Recepción</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Se actualizará el inventario:
            </p>
            <div className="mb-3 max-h-48 overflow-y-auto border rounded-lg">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-1.5 text-left">Producto/Color</th>
                    <th className="px-3 py-1.5 text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(selectedCompra.detalle || []).map((d, idx) => {
                    const producto = productos.find(p => p.ProductoId === d.ProductoId);

                    if (d.colores && d.colores.length > 0) {
                      return d.colores.map((color, cIdx) => (
                        <tr key={`${idx}-${cIdx}`}>
                          <td className="px-3 py-1.5">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color.Hex }} />
                              <span>{producto?.Nombre} - {color.Nombre}</span>
                            </div>
                          </td>
                          <td className="px-3 py-1.5 text-right font-medium text-green-600">+{color.Stock}</td>
                        </tr>
                      ));
                    } else {
                      return (
                        <tr key={idx}>
                          <td className="px-3 py-1.5">{producto?.Nombre || `ID: ${getShortId(d.ProductoId)}`}</td>
                          <td className="px-3 py-1.5 text-right font-medium text-green-600">+{d.Cantidad}</td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmRecibido}
                disabled={updating}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {updating ? 'Procesando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setProximoEstado(null);
                }}
                disabled={updating}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelación */}
      <CancelacionModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setEstadoSeleccionado(estadoActual);
        }}
        onConfirm={handleConfirmCancel}
        pedidoId={selectedCompra.CompraId}
      />
    </>
  );
};