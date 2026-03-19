import React from "react";
import {
  ArrowLeft, Package,
  CheckCircle,
  Store, Palette
} from "lucide-react";
import { ESTADOS_COMPRA } from "../hook/useCompras";
import { generarFacturaCompraPDF } from './InvoicePDF.jsx';
import { toast } from "react-toastify";

const getShortId = (id) => {
  if (!id) return "---";
  const str = String(id);
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

// Configuración de estados - AHORA SOLO APROBADO
const estadoConfig = {
  [ESTADOS_COMPRA.APROBADO]: {
    color: 'bg-green-100 text-green-800',
    borderColor: 'border-green-200',
    label: 'Aprobado',
    icon: CheckCircle,
    description: 'Compra aprobada'
  }
};

export const ComprasView = ({
  selectedCompra,
  productos = [],
  colores = [],
  proveedores = [],
  onBack,
  getProveedorDisplay
}) => {
  console.log("[ComprasView] selectedCompra recibido:", selectedCompra);

  // ✅ Validación temprana
  if (!selectedCompra) {
    console.warn("[ComprasView] No hay selectedCompra, retornando null");
    return null;
  }

  if (!selectedCompra.CompraId) {
    console.error("[ComprasView] selectedCompra no tiene CompraId:", selectedCompra);
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-red-500">Error: Datos de compra incompletos</p>
        <button onClick={onBack} className="mt-4 bg-gray-200 px-4 py-2 rounded-lg">
          Volver
        </button>
      </div>
    );
  }

  const estadoActual = selectedCompra.Estado || ESTADOS_COMPRA.APROBADO;
  const configActual = estadoConfig[estadoActual] || estadoConfig[ESTADOS_COMPRA.APROBADO];
  const IconoActual = configActual.icon;

  // Asegurar que detalle sea un array
  const detalleCompra = Array.isArray(selectedCompra.detalle) ? selectedCompra.detalle : [];

  const handleDescargarFactura = () => {
    try {
      console.log(" DATOS COMPLETOS DE LA COMPRA:", JSON.stringify(selectedCompra, null, 2));
      
      // Buscar el proveedor
      const proveedor = proveedores.find(p => p.ProveedorId === selectedCompra.ProveedorId);
      
      if (!detalleCompra || detalleCompra.length === 0) {
        toast.error('No hay productos en esta compra para facturar');
        return;
      }

      // ENRIQUECER LOS DETALLES CON NOMBRES DE PRODUCTOS Y COLORES
      const detallesConNombres = detalleCompra.map(d => {
        const productoCompleto = productos.find(p => p.ProductoId === d.ProductoId);
        
        let coloresProcesados = [];
        
        if (d.colores && Array.isArray(d.colores) && d.colores.length > 0) {
          coloresProcesados = d.colores.map(color => ({
            Nombre: color.Nombre || color.nombre || 'Color sin nombre',
            Stock: Number(color.Stock || color.stock || color.Cantidad || 0),
            Hex: color.Hex || color.hex || '#CCCCCC',
            ...color
          }));
        }

        return {
          ...d,
          ProductoNombre: productoCompleto?.Nombre || d.ProductoNombre || d.nombreProducto || 'Producto sin nombre',
          Cantidad: Number(d.Cantidad) || 0,
          PrecioUnitario: Number(d.PrecioUnitario) || 0,
          Subtotal: Number(d.Subtotal) || (Number(d.Cantidad) * Number(d.PrecioUnitario)) || 0,
          colores: coloresProcesados
        };
      });

      generarFacturaCompraPDF(
        selectedCompra,
        detallesConNombres,
        proveedor
      );

      toast.success('Factura generada correctamente');
    } catch (error) {
      console.error(' Error al generar factura:', error);
      toast.error(`Error al generar la factura: ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 max-w-full overflow-hidden">
      {/* Header */}
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

        {/* Badge de estado - AHORA SOLO VERDE */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${configActual.color}`}>
          <IconoActual size={14} />
          <span className="truncate">{configActual.label}</span>
        </div>
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-50 p-3 rounded-lg border">
          <div className="text-[10px] text-slate-600 mb-1 flex items-center gap-1">
            <Store size={12} /> Proveedor
          </div>
          <div className="font-medium text-sm truncate">
            {getProveedorDisplay ? 
              getProveedorDisplay(selectedCompra.ProveedorId, selectedCompra.nombreProveedor) : 
              selectedCompra.nombreProveedor || `ID: ${getShortId(selectedCompra.ProveedorId)}`}
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border">
          <div className="text-[10px] text-slate-600 mb-1">Fecha</div>
          <div className="font-medium text-sm">{formatearFecha(selectedCompra.FechaRegistro)}</div>
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
            Artículos ({detalleCompra.length})
          </h4>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {detalleCompra.length > 0 ? (
            detalleCompra.map((d, index) => {
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
                          {producto?.Nombre || d.ProductoNombre || `Producto ID: ${getShortId(d.ProductoId)}`}
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
                          : `${d.Cantidad || 0} x ${formatPrice(d.PrecioUnitario)}`
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
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay detalles disponibles para esta compra
            </div>
          )}
        </div>

        {/* Total */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Total de la Compra</span>
            <span className="text-lg font-bold text-blue-700">{formatPrice(selectedCompra.Total)}</span>
          </div>
        </div>
      </div>

      {/* Mensaje de compra aprobada */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm text-green-700 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          Esta compra ha sido aprobada automáticamente.
        </p>
      </div>
    </div>
  );
};