import React, { useState } from "react";
import { Package, Trash2, X, Upload, FileText, Palette } from "lucide-react";
import { getColorById, formatPrice } from "../pedidos/utils/pedidosHelpers";

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
  onUploadArchivo,
  onEliminarArchivo,
  puedeEliminar = true
}) => {
  const [mostrarOpcionesStock, setMostrarOpcionesStock] = useState(false);
  const subtotal = (detalle.Cantidad || 0) * (detalle.Precio || 0);

  // Tipo de stock: 'general' o 'por_color'
  const tipoStock = detalle.tipoStock || 'general';

  // Función para determinar el ícono según el tipo de archivo
  const getFileIcon = (tipoArchivo, url) => {
    if (!url) return <Upload size={24} className="text-blue-500" />;
    
    if (tipoArchivo?.startsWith('image/')) {
      return null;
    }
    
    if (url.match(/\.pdf$/i) || tipoArchivo === 'application/pdf') {
      return <FileText size={32} className="text-red-500" />;
    }
    
    if (url.match(/\.(doc|docx)$/i) || tipoArchivo?.includes('word')) {
      return <FileText size={32} className="text-blue-600" />;
    }
    
    if (url.match(/\.(xls|xlsx)$/i) || tipoArchivo?.includes('excel')) {
      return <FileText size={32} className="text-green-600" />;
    }
    
    return <FileText size={32} className="text-gray-600" />;
  };

  // Función para obtener el nombre del archivo de la URL
  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Archivo';
  };

  // Cambiar tipo de stock
  const cambiarTipoStock = (nuevoTipo) => {
    onActualizar(index, 'tipoStock', nuevoTipo);
    if (nuevoTipo === 'general') {
      onActualizar(index, 'ColorId', null);
    }
    setMostrarOpcionesStock(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      {/* Fila principal - MANTENIENDO LA MISMA DISTRIBUCIÓN */}
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* Tipo - Select */}
        <div className="col-span-1">
          <select
            value={esServicio ? 'servicio' : 'producto'}
            onChange={(e) => onTipoChange(index, e.target.value)}
            className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="producto">Prod</option>
            <option value="servicio">Serv</option>
          </select>
        </div>

        {/* Producto/Servicio - Selector */}
        <div className="col-span-3">
          {esServicio ? (
            <button
              onClick={() => onAbrirServicios(index)}
              className="w-full px-3 py-2 border rounded-lg hover:bg-slate-50 text-left flex items-center gap-2 text-sm"
            >
              {imagenUrl ? (
                <img 
                  src={imagenUrl} 
                  alt="" 
                  className="w-6 h-6 object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                  <Package size={12} className="text-purple-600" />
                </div>
              )}
              <span className="flex-1 truncate text-slate-700">
                {itemSeleccionado ? itemNombre : "Seleccionar servicio..."}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onAbrirProductos(index)}
              className="w-full px-3 py-2 border rounded-lg hover:bg-slate-50 text-left flex items-center gap-2 text-sm"
            >
              {imagenUrl ? (
                <img 
                  src={imagenUrl} 
                  alt="" 
                  className="w-6 h-6 object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                  <Package size={12} className="text-blue-600" />
                </div>
              )}
              <span className="flex-1 truncate text-slate-700">
                {itemSeleccionado ? itemNombre : "Seleccionar producto..."}
              </span>
            </button>
          )}
        </div>

        {/* Tipo de Stock (solo productos) */}
        <div className="col-span-2">
          {!esServicio && itemSeleccionado ? (
            <div className="relative">
              <button
                onClick={() => setMostrarOpcionesStock(!mostrarOpcionesStock)}
                className="w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between text-sm bg-white hover:bg-slate-50"
              >
                <span>
                  {tipoStock === 'general' ? 'Stock General' : 'Stock x Color'}
                </span>
                <span className="text-xs text-slate-400">▼</span>
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
          ) : (
            <span className="text-sm text-slate-400 px-2">—</span>
          )}
        </div>

        {/* Cantidad */}
        <div className="col-span-1">
          <input
            type="number"
            min="1"
            value={detalle.Cantidad || 1}
            onChange={(e) => onActualizar(index, "Cantidad", parseInt(e.target.value) || 1)}
            className={`w-full px-3 py-2 border rounded-lg text-center text-sm ${
              tipoStock === 'por_color' ? 'bg-slate-100 opacity-60' : ''
            }`}
            disabled={!itemSeleccionado || tipoStock === 'por_color'}
          />
        </div>

        {/* Precio Unitario */}
        <div className="col-span-2">
          <input
            type="number"
            step="0.01"
            min="0"
            value={detalle.Precio || 0}
            onChange={(e) => onActualizar(index, "Precio", parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-lg text-right text-sm"
            disabled={!itemSeleccionado}
          />
        </div>

        {/* Subtotal */}
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

      {/* FILA DE COLOR (solo para productos con stock por color) - Aparece debajo */}
      {!esServicio && itemSeleccionado && tipoStock === 'por_color' && (
        <div className="mt-3 pl-[16.66%] grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <button
              onClick={() => onAbrirColores(index)}
              className={`w-full px-3 py-2 border rounded-lg text-left flex items-center gap-2 text-sm ${
                !itemSeleccionado ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'
              }`}
            >
              {detalle.ColorId && colorInfo ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: colorInfo.Hex || colorInfo.CodigoHex }}
                  />
                  <span className="truncate text-slate-700">{colorInfo.Nombre}</span>
                </>
              ) : (
                <>
                  <Palette size={16} className="text-purple-600" />
                  <span className="text-slate-500">Seleccionar color</span>
                </>
              )}
            </button>
          </div>
          
          {/* Mensaje de stock por color */}
          <div className="col-span-8 flex items-center text-xs text-slate-500">
            {detalle.ColorId ? (
              <span className="text-green-600">✓ Color seleccionado</span>
            ) : (
              <span className="text-amber-600">⚠️ Debe seleccionar un color</span>
            )}
          </div>
        </div>
      )}

      {/* FILA DE STOCK GENERAL (solo para productos con stock general) */}
      {!esServicio && itemSeleccionado && tipoStock === 'general' && (
        <div className="mt-2 pl-[16.66%] text-xs text-slate-500">
          Stock disponible: <span className="font-medium text-slate-700">{detalle.Stock || 1}</span>
        </div>
      )}
      
      {/* SECCIÓN PARA SUBIR ARCHIVOS - SOLO PARA SERVICIOS */}
      {esServicio && itemSeleccionado && (
        <div className="mt-3 pl-[8.33%]">
          <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
            <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Upload size={16} className="text-blue-600" />
              Adjuntar archivo (opcional)
            </label>
            
            {detalle.UrlImagenPersonalizada ? (
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg border bg-white flex items-center justify-center overflow-hidden">
                  {detalle.tipoArchivo?.startsWith('image/') ? (
                    <img 
                      src={detalle.UrlImagenPersonalizada} 
                      alt="Vista previa" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getFileIcon(detalle.tipoArchivo, detalle.UrlImagenPersonalizada)
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    {detalle.nombreArchivo || getFileNameFromUrl(detalle.UrlImagenPersonalizada)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {detalle.tipoArchivo || 'Archivo'} • {(detalle.tamañoArchivo / 1024).toFixed(2)} KB
                  </p>
                  <button
                    onClick={() => onEliminarArchivo?.(index)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg"
                  >
                    <X size={12} /> Eliminar archivo
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onUploadArchivo?.(index, file);
                    }
                    e.target.value = '';
                  }}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-slate-400 mt-2">Máximo 10MB por archivo</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Mensaje de error si no hay item seleccionado */}
      {!itemSeleccionado && (
        <div className="mt-2 text-xs text-amber-600 pl-[16.66%]">
          • Debe seleccionar un {esServicio ? 'servicio' : 'producto'}
        </div>
      )}
    </div>
  );
};