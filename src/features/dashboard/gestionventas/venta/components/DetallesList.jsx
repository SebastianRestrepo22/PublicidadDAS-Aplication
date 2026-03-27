import React from 'react';
import { Plus, Package } from 'lucide-react';
import { DetalleItem } from './DetalleItem';

export const DetallesList = ({
  detalles,
  detallesPaginados,
  erroresDetalle,
  indiceInicial,
  paginaActual,
  totalPaginas,
  itemsPorPagina,
  onPaginaChange,
  onAgregarDetalle,
  onEliminarDetalle,
  onTipoItemChange,
  onCantidadChange,
  onPrecioChange,
  onDescripcionChange,
  onAbrirModalProductos,
  onAbrirModalColores,
  getMaxStock,
  coloresPorProducto,
}) => {
  return (
    <div className="bg-slate-50 p-6 rounded-xl relative">
      {/* Header sticky */}
      <div className="sticky top-0 bg-slate-50 z-10 pb-4 border-b border-slate-200 mb-4 flex justify-between items-center">
        <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
          <Package size={20} /> Productos y Servicios
        </h4>
        <button
          type="button"
          onClick={onAgregarDetalle}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={18} /> Agregar Producto
        </button>
      </div>

      {/* Botón flotante para móvil */}
      <div className="lg:hidden fixed bottom-4 right-4 z-20">
        <button
          type="button"
          onClick={onAgregarDetalle}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center"
          title="Agregar producto"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="hidden lg:grid grid-cols-12 gap-3 mb-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
        <div className="col-span-1">Tipo</div>
        <div className="col-span-3">Producto/Servicio</div>
        <div className="col-span-2">Color / Notas</div>
        <div className="col-span-1">Cant.</div>
        <div className="col-span-2">Precio Unit.</div>
        <div className="col-span-2">Subtotal</div>
        <div className="col-span-1 text-center">Acción</div>
      </div>

      <div className="space-y-3">
        {detallesPaginados.map((detalle, idx) => {
          const indexReal = indiceInicial + idx;
          const errores = erroresDetalle[indexReal] || {};
          const tieneColores = detalle.ItemId ? (coloresPorProducto[detalle.ItemId]?.length > 0) : false;
          const esProducto = detalle.TipoItem === 'producto';
          const esServicio = detalle.TipoItem === 'servicio';
          const maxStock = getMaxStock(detalle);
          const puedeEliminar = detalles.length > 1;

          return (
            <DetalleItem
              key={detalle._tempId}
              detalle={detalle}
              index={idx}
              indexReal={indexReal}
              errores={errores}
              tieneColores={tieneColores}
              esProducto={esProducto}
              esServicio={esServicio}
              maxStock={maxStock}
              coloresPorProducto={coloresPorProducto}
              onTipoItemChange={onTipoItemChange}
              onAbrirModalProductos={onAbrirModalProductos}
              onAbrirModalColores={onAbrirModalColores}
              onCantidadChange={onCantidadChange}
              onPrecioChange={onPrecioChange}
              onDescripcionChange={onDescripcionChange}
              onEliminar={onEliminarDetalle}
              puedeEliminar={puedeEliminar}
            />
          );
        })}
      </div>

      {detalles.length > itemsPorPagina && (
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="text-sm text-slate-600">
            Mostrando {indiceInicial + 1} - {Math.min(indiceInicial + itemsPorPagina, detalles.length)} de {detalles.length} productos
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPaginaChange(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 text-sm"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm">Página {paginaActual} de {totalPaginas}</span>
            <button
              type="button"
              onClick={() => onPaginaChange(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 text-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};