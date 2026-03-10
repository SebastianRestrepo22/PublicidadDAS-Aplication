import React from "react";
import { Package, Trash2, X, Upload, FileText } from "lucide-react";
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
  onUploadArchivo, // Cambiado de onUploadImagen
  onEliminarArchivo, // Nueva prop
  puedeEliminar = true
}) => {
  const subtotal = (detalle.Cantidad || 0) * (detalle.Precio || 0);

  // Función para determinar el ícono según el tipo de archivo
  const getFileIcon = (tipoArchivo, url) => {
    if (!url) return <Upload size={24} className="text-blue-500" />;
    
    if (tipoArchivo?.startsWith('image/')) {
      return null; // Se maneja con img
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

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
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

        {/* Color/Tamaño */}
        <div className="col-span-2">
          {esServicio ? (
            <select
              value={detalle.Tamaño || "Mediana"}
              onChange={(e) => onActualizar(index, "Tamaño", e.target.value)}
              disabled={!itemSeleccionado}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                !itemSeleccionado ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
              }`}
            >
              <option value="Pequeña">Pequeña</option>
              <option value="Mediana">Mediana</option>
              <option value="Grande">Grande</option>
            </select>
          ) : (
            <button
              onClick={() => onAbrirColores(index)}
              disabled={!itemSeleccionado}
              className={`w-full px-3 py-2 border rounded-lg text-left flex items-center gap-2 text-sm ${
                !itemSeleccionado ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'
              }`}
            >
              {detalle.ColorId && colorInfo && (
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: colorInfo.Hex }}
                />
              )}
              <span className="truncate text-slate-700">
                {detalle.ColorId ? colorInfo?.Nombre : "Sin color"}
              </span>
            </button>
          )}
        </div>

        {/* Cantidad */}
        <div className="col-span-1">
          <input
            type="number"
            min="1"
            value={detalle.Cantidad}
            onChange={(e) => onActualizar(index, "Cantidad", parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border rounded-lg text-center text-sm"
            disabled={!itemSeleccionado}
          />
        </div>

        {/* Precio Unitario */}
        <div className="col-span-2">
          <input
            type="number"
            step="0.01"
            min="0"
            value={detalle.Precio}
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
      
      {/* 🔴 SECCIÓN PARA SUBIR ARCHIVOS - SOLO PARA SERVICIOS */}
      {esServicio && itemSeleccionado && (
        <div className="mt-3 pl-[8.33%]">
          <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
            <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Upload size={16} className="text-blue-600" />
              Adjuntar archivo (opcional)
            </label>
            
            {detalle.UrlImagenPersonalizada ? (
              <div className="flex items-start gap-4">
                {/* Vista previa según el tipo de archivo */}
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
                    // Limpiar el input para poder subir el mismo archivo nuevamente
                    e.target.value = '';
                  }}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="bg-white px-2 py-1 rounded border">📷 Imágenes</span>
                  <span className="bg-white px-2 py-1 rounded border">📄 PDF</span>
                  <span className="bg-white px-2 py-1 rounded border">📝 Word</span>
                  <span className="bg-white px-2 py-1 rounded border">📊 Excel</span>
                  <span className="bg-white px-2 py-1 rounded border">📃 TXT</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Máximo 10MB por archivo</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Mensaje de stock si es producto y está seleccionado */}
      {!esServicio && itemSeleccionado && (
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
          <span className="font-medium">Stock: {detalle.Stock || 1}</span>
          {!detalle.ColorId && (
            <span className="text-amber-600">• Debe seleccionar un color</span>
          )}
        </div>
      )}
      
      {/* Mensaje de error si no hay item seleccionado */}
      {!itemSeleccionado && (
        <div className="mt-2 text-xs text-amber-600">
          • Debe seleccionar un {esServicio ? 'servicio' : 'producto'}
        </div>
      )}
    </div>
  );
};