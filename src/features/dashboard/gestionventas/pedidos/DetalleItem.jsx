import React, { useState } from "react";
import { Package, Trash2, X, Palette, ChevronDown } from "lucide-react";
import { formatPrice } from "../pedidos/utils/pedidosHelpers";

export const DetalleItem = ({
  detalle,
  index,
  esServicio,
  itemSeleccionado,
  itemNombre,
  imagenUrl,
  colorInfo,
  servicioInfo,
  colores,
  onTipoChange,
  onAbrirProductos,
  onAbrirServicios,
  onAbrirColores,
  onActualizar,
  onEliminar,
  puedeEliminar = true
}) => {
  const [mostrarOpcionesStock, setMostrarOpcionesStock] = useState(false);
  const subtotal = (detalle.Cantidad || 0) * (detalle.Precio || 0);

  // Tipo de stock: 'general' o 'por_color'
  const tipoStock = detalle.tipoStock || 'general';

  // Cambiar tipo de stock
  const cambiarTipoStock = (nuevoTipo) => {
    onActualizar(index, 'tipoStock', nuevoTipo);
    if (nuevoTipo === 'general') {
      onActualizar(index, 'ColorId', null);
    }
    setMostrarOpcionesStock(false);
  };

  // Determinar la imagen a mostrar
  const imagenAMostrar = detalle.UrlImagen || detalle.ProductoImagen || imagenUrl;

  // 🔥 Manejar cambio de precio - permitir números y puntos
  const handlePrecioChange = (e) => {
    const value = e.target.value;
    // Permitir vacío, números y puntos (para formato de miles)
    if (value === '' || /^[\d.,]*$/.test(value)) {
      onActualizar(index, "Precio", value);
    }
  };

  // 🔥 Manejar blur del precio - formatear con puntos de miles
  const handlePrecioBlur = () => {
    let precio = detalle.Precio;
    if (!precio || precio === '') {
      onActualizar(index, "Precio", 0);
      return;
    }

    // Limpiar el string: eliminar puntos (separadores de miles) y convertir a número
    const precioLimpio = String(precio).replace(/\./g, '').replace(',', '.');
    const precioNumero = parseFloat(precioLimpio) || 0;
    
    console.log('💰 Precio original:', precio, 'Limpio:', precioLimpio, 'Número:', precioNumero);
    
    // Guardar el número sin formato
    onActualizar(index, "Precio", precioNumero);
  };

  // Formatear el precio para mostrarlo con puntos de miles
  const precioFormateado = () => {
    if (!detalle.Precio && detalle.Precio !== 0) return '';
    
    // Si es string, intentar limpiarlo primero
    let valorNumerico = detalle.Precio;
    if (typeof valorNumerico === 'string') {
      valorNumerico = parseFloat(valorNumerico.replace(/\./g, '').replace(',', '.')) || 0;
    }
    
    // Formatear con puntos de miles (ej: 1.200.000)
    return valorNumerico.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Manejar cambio de cantidad
  const handleCantidadChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      onActualizar(index, "Cantidad", value === '' ? '' : parseInt(value, 10));
    }
  };

  const handleCantidadBlur = () => {
    const cantidad = detalle.Cantidad;
    if (cantidad === '' || cantidad === null || isNaN(parseInt(cantidad, 10)) || parseInt(cantidad, 10) < 1) {
      onActualizar(index, "Cantidad", 1);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      {/* Fila principal */}
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Tipo - Select */}
        <div className="col-span-1">
          <select
            value={esServicio ? 'servicio' : 'producto'}
            onChange={(e) => onTipoChange(index, e.target.value)}
            className="w-full px-2 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="producto">Prod</option>
            <option value="servicio">Serv</option>
          </select>
        </div>

        {/* Producto/Servicio - Selector */}
        <div className="col-span-3">
          {itemSeleccionado ? (
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50">
              {imagenAMostrar ? (
                <img 
                  src={imagenAMostrar} 
                  alt="" 
                  className="w-6 h-6 object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className={`w-6 h-6 ${esServicio ? 'bg-purple-100' : 'bg-blue-100'} rounded flex items-center justify-center`}>
                  <Package size={12} className={esServicio ? 'text-purple-600' : 'text-blue-600'} />
                </div>
              )}
              <span className="flex-1 truncate text-slate-700 text-sm font-medium">
                {detalle.ProductoNombre || itemNombre || (esServicio ? 'Servicio' : 'Producto')}
              </span>
            </div>
          ) : (
            <button
              onClick={() => esServicio ? onAbrirServicios(index) : onAbrirProductos(index)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-left text-sm text-slate-500"
            >
              + Seleccionar {esServicio ? 'servicio' : 'producto'}
            </button>
          )}
        </div>

        {/* Tipo de Stock (solo productos) */}
        <div className="col-span-2">
          {!esServicio && itemSeleccionado ? (
            <div className="relative">
              <button
                onClick={() => setMostrarOpcionesStock(!mostrarOpcionesStock)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left flex items-center justify-between text-sm bg-white hover:bg-slate-50"
              >
                <span>
                  {tipoStock === 'general' ? 'Stock General' : 'Stock x Color'}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              
              {mostrarOpcionesStock && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-20">
                  <button
                    onClick={() => cambiarTipoStock('general')}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 rounded-t-lg"
                  >
                    Stock General
                  </button>
                  <button
                    onClick={() => cambiarTipoStock('por_color')}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 rounded-b-lg"
                  >
                    Stock por Color
                  </button>
                </div>
              )}
            </div>
          ) : !esServicio ? (
            <span className="text-sm text-slate-400 px-2">—</span>
          ) : (
            <span className="text-sm text-slate-400 px-2">—</span>
          )}
        </div>

        {/* Cantidad */}
        <div className="col-span-1">
          <input
            type="text"
            inputMode="numeric"
            value={detalle.Cantidad || ''}
            onChange={handleCantidadChange}
            onBlur={handleCantidadBlur}
            placeholder="0"
            className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-center text-sm ${
              tipoStock === 'por_color' ? 'bg-slate-100 opacity-60' : 'bg-white'
            }`}
            disabled={!itemSeleccionado || tipoStock === 'por_color'}
          />
        </div>

        {/*  Precio Unitario con signo $ y formato de miles */}
        <div className="col-span-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={precioFormateado()}
              onChange={handlePrecioChange}
              onBlur={handlePrecioBlur}
              placeholder="0"
              className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-right text-sm bg-white"
              disabled={!itemSeleccionado}
            />
          </div>
        </div>

        {/* Subtotal con formato de miles */}
        <div className="col-span-2">
          <div className="px-3 py-2 bg-blue-50 rounded-lg text-right font-semibold text-blue-700 text-sm">
              {formatPrice(subtotal)}  
          </div>
        </div>

        {/* Acción - Eliminar */}
        <div className="col-span-1 text-right">
          {puedeEliminar && (
            <button
              onClick={() => onEliminar(index)}
              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* FILA DE COLOR (solo para productos con stock por color) */}
      {!esServicio && itemSeleccionado && tipoStock === 'por_color' && (
        <div className="mt-3 grid grid-cols-12 gap-4">
          <div className="col-span-4 col-start-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAbrirColores(index)}
                className={`flex-1 px-3 py-2 border rounded-lg text-left flex items-center gap-2 text-sm ${
                  detalle.ColorId ? 'bg-blue-50 border-blue-300' : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                {detalle.ColorId ? (
                  <>
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: detalle.ColorHex || (colorInfo?.Hex || colorInfo?.CodigoHex) || '#ccc' }}
                    />
                    <span className="truncate text-slate-700">
                      {detalle.ColorNombre || (colorInfo?.Nombre) || 'Color'}
                    </span>
                  </>
                ) : (
                  <>
                    <Palette size={16} className="text-purple-600" />
                    <span className="text-slate-500">Seleccionar color</span>
                  </>
                )}
              </button>
              {detalle.ColorId && (
                <button
                  onClick={() => onActualizar(index, 'ColorId', null)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  title="Quitar color"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="col-span-6 flex items-center">
            {!detalle.ColorId && (
              <span className="text-xs text-amber-600">⚠️ Debe seleccionar un color</span>
            )}
          </div>
        </div>
      )}

      {/* FILA DE STOCK GENERAL (solo para productos con stock general) */}
      {!esServicio && itemSeleccionado && tipoStock === 'general' && (
        <div className="mt-2 grid grid-cols-12 gap-4">
          <div className="col-span-4 col-start-2">
            <span className="text-xs text-slate-500">
              Stock disponible: <span className="font-medium text-slate-700">{detalle.Stock || 1}</span>
            </span>
          </div>
        </div>
      )}
      
      {/* Mensaje de error si no hay item seleccionado */}
      {!itemSeleccionado && (
        <div className="mt-2 grid grid-cols-12 gap-4">
          <div className="col-span-4 col-start-2">
            <span className="text-xs text-amber-600">
              • Debe seleccionar un {esServicio ? 'servicio' : 'producto'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};