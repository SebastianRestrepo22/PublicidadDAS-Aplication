import React from "react";
import { Package, Trash2, X, Upload } from "lucide-react";
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
  onUploadImagen,
  puedeEliminar = true
}) => {
  const subtotal = (detalle.Cantidad || 0) * (detalle.Precio || 0);

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
      
      {/* Sección para subir imagen (solo para servicios que lo requieran) */}
      {esServicio && itemSeleccionado && detalle.RequiereImagen && (
        <div className="mt-3 pl-[8.33%]">
          <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50">
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Imagen del cliente (foto, documento, etc.)
            </label>
            
            {detalle.UrlImagenPersonalizada ? (
              <div className="flex items-center gap-3">
                <img 
                  src={detalle.UrlImagenPersonalizada} 
                  alt="Vista previa" 
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <p className="text-xs text-slate-600 mb-2">Imagen cargada</p>
                  <button
                    onClick={() => {
                      if (detalle.UrlImagenPersonalizada?.startsWith('blob:')) {
                        URL.revokeObjectURL(detalle.UrlImagenPersonalizada);
                      }
                      onActualizar(index, "UrlImagenPersonalizada", null);
                      onActualizar(index, "ImagenPersonalizadaFile", null);
                    }}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <X size={12} /> Eliminar imagen
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onUploadImagen(index, file);
                    }
                  }}
                  className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={!itemSeleccionado}
                />
                <span className="text-xs text-slate-400">Máx 5MB</span>
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