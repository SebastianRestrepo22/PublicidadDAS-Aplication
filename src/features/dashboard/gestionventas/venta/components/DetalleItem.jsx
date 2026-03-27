import React from 'react';
import { ChevronRight, Trash2, AlertCircle } from 'lucide-react';

const formatPrice = (value, currency = '$') => {
  if (value === null || value === undefined || value === '') return `${currency}0`;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `${currency}0`;
  return `${currency} ${Math.round(num).toLocaleString('es-CO')}`;
};

export const DetalleItem = ({
  detalle,
  index,
  indexReal,
  errores,
  tieneColores,
  esProducto,
  esServicio,
  maxStock,
  coloresPorProducto,
  onTipoItemChange,
  onAbrirModalProductos,
  onAbrirModalColores,
  onCantidadChange,
  onPrecioChange,
  onDescripcionChange,
  onEliminar,
  puedeEliminar,
}) => {
  return (
    <div
      id={`detalle-${indexReal}`}
      className={`bg-white border ${Object.keys(errores).length > 0 ? 'border-red-300 bg-red-50' : 'border-slate-200'} rounded-xl p-4`}
    >
      {/* FILA PRINCIPAL - 12 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Col 1: Tipo */}
        <div className="lg:col-span-1">
          <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Tipo:</span>
          <select
            value={detalle.TipoItem}
            onChange={(e) => onTipoItemChange(indexReal, e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white h-[42px]"
          >
            <option value="producto">Producto</option>
            <option value="servicio">Servicio</option>
          </select>
        </div>

        {/* Col 2: Producto/Servicio */}
        <div className="lg:col-span-3">
          <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Item:</span>
          <button
            type="button"
            onClick={() => onAbrirModalProductos(indexReal)}
            className={`w-full text-sm border rounded-lg px-3 py-2.5 bg-white hover:bg-slate-50 text-left flex items-center justify-between h-[42px] ${
              errores.item ? 'border-red-500' : 'border-slate-300'
            }`}
          >
            <span className="truncate font-medium">{detalle.NombreSnapshot || "Seleccionar"}</span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Col 3: Color (para productos) o Indicador (para servicios) */}
        <div className="lg:col-span-2">
          <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">
            {esProducto ? 'Color:' : 'Notas:'}
          </span>

          {esProducto ? (
            <button
              type="button"
              onClick={() => onAbrirModalColores(indexReal)}
              disabled={!detalle.ItemId || !tieneColores}
              className={`w-full text-sm border rounded-lg px-3 py-2.5 bg-white hover:bg-slate-50 text-left flex items-center gap-2 h-[42px] ${
                errores.color ? 'border-red-500' : 'border-slate-300'
              } ${(!detalle.ItemId || !tieneColores) ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
            >
              {detalle.ColorId && (
                <div
                  className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0"
                  style={{
                    backgroundColor: coloresPorProducto[detalle.ItemId]?.find(c => c.ColorId === detalle.ColorId)?.Hex || '#e5e7eb'
                  }}
                />
              )}
              <span className="truncate">
                {detalle.ColorId
                  ? (coloresPorProducto[detalle.ItemId]?.find(c => c.ColorId === detalle.ColorId)?.Nombre || "Color")
                  : (!detalle.ItemId || !tieneColores) ? "Sin colores" : "Seleccionar color"}
              </span>
            </button>
          ) : (
            <div className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-500 h-[42px] flex items-center">
              {detalle.DescripcionPersonalizada ? (
                <span className="truncate">📝 Notas agregadas</span>
              ) : (
                <span className="truncate italic">Sin notas</span>
              )}
            </div>
          )}
        </div>

        {/* Col 4: Cantidad */}
        <div className="lg:col-span-1">
          <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Cant.:</span>
          <input
            type="number"
            min="1"
            max={esProducto ? maxStock : undefined}
            value={detalle.Cantidad}
            onChange={(e) => onCantidadChange(indexReal, e.target.value)}
            className={`w-full text-sm border rounded-lg px-3 py-2.5 h-[42px] ${
              (errores.cantidad || errores.stock) ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {esProducto && maxStock < 999999 && (
            <div className="text-xs text-slate-500 mt-1">Stock: {maxStock}</div>
          )}
        </div>

        {/* Col 5: Precio */}
        <div className="lg:col-span-2">
          <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Precio:</span>
          {esProducto ? (
            <div className="text-sm bg-slate-100 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-700 font-medium h-[42px] flex items-center">
              {formatPrice(detalle.PrecioUnitario)}
            </div>
          ) : (
            <input
              type="number"
              min="0"
              step="0.01"
              value={detalle.PrecioUnitario || ''}
              onChange={(e) => onPrecioChange(indexReal, e.target.value)}
              placeholder="Ingrese precio"
              className={`w-full text-sm border rounded-lg px-3 py-2.5 h-[42px] focus:ring-2 focus:ring-blue-500 ${
                errores.precio ? 'border-red-500 bg-red-50' : 'border-slate-300'
              }`}
            />
          )}
        </div>

        {/* Col 6: Subtotal */}
        <div className="lg:col-span-2">
          <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Subtotal:</span>
          <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 font-semibold text-blue-700 h-[42px] flex items-center">
            {formatPrice((detalle.Cantidad || 1) * detalle.PrecioUnitario)}
          </div>
        </div>

        {/* Col 7: Acción */}
        <div className="lg:col-span-1 flex justify-center">
          {puedeEliminar && (
            <button
              type="button"
              onClick={() => onEliminar(indexReal)}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors h-[42px] w-[42px] flex items-center justify-center"
              title="Eliminar"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* DESCRIPCIÓN - SOLO para servicios */}
      {esServicio && detalle.ItemId && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Descripción detallada del servicio
          </label>
          <textarea
            value={detalle.DescripcionPersonalizada || ''}
            onChange={(e) => onDescripcionChange(indexReal, e.target.value)}
            placeholder="Ej: Diseño de logo con 3 revisiones, incluye fuente vectorial, etc."
            rows="3"
            className="w-full text-sm border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            Estas notas se guardarán en el detalle de la venta.
          </p>
        </div>
      )}

      {/* Mensajes de error */}
      {Object.keys(errores).length > 0 && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
          <div className="text-xs text-red-600 flex flex-wrap gap-2">
            {Object.values(errores).map((error, i) => (
              <span key={i} className="flex items-center gap-1">
                <AlertCircle size={12} />
                {error}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};