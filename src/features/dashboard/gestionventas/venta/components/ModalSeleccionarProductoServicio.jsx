import React from 'react';
import { Search } from 'lucide-react';
import Modal from '../../../components/modals/modal.jsx';

const formatPrice = (value, currency = '$') => {
  if (value === null || value === undefined || value === '') return `${currency}0`;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `${currency}0`;
  return `${currency} ${Math.round(num).toLocaleString('es-CO')}`;
};

export const ModalSeleccionarProductoServicio = ({
  open,
  onClose,
  esProducto,
  busqueda,
  onBusquedaChange,
  productosFiltrados,
  serviciosFiltrados,
  paginaProducto,
  totalPaginasProducto,
  onPaginaChange,
  onSeleccionarItem,
}) => {
  const itemsFiltrados = esProducto ? productosFiltrados : serviciosFiltrados;
  const itemsPorPagina = 8;
  const inicio = (paginaProducto - 1) * itemsPorPagina;
  const itemsPaginados = itemsFiltrados.slice(inicio, inicio + itemsPorPagina);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[600px] p-6">
        <h3 className="text-lg font-bold mb-4">
          Seleccionar {esProducto ? 'Producto' : 'Servicio'}
        </h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => {
                onBusquedaChange(e.target.value);
                onPaginaChange(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
            {itemsFiltrados.length} {itemsFiltrados.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>
        <div className="max-h-[400px] overflow-y-auto border border-slate-200 rounded-lg p-2">
          {itemsFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {esProducto ? "No hay productos disponibles" : "No hay servicios disponibles"}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {itemsPaginados.map(item => {
                  if (esProducto) {
                    const p = item;
                    const tieneColores = p.UsaColores === 1 && p.Colores && p.Colores.length > 0;
                    return (
                      <button
                        key={p.ProductoId}
                        onClick={() => onSeleccionarItem({ ...p, tipo: 'producto' })}
                        className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <span className="font-medium">{p.Nombre}</span>
                          {tieneColores ? (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              {p.Colores.length} colores
                            </span>
                          ) : p.Stock > 0 ? (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              Stock: {p.Stock}
                            </span>
                          ) : (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                              Sin stock
                            </span>
                          )}
                        </div>
                        <span className="text-blue-600 font-medium">{formatPrice(p.Precio)}</span>
                      </button>
                    );
                  } else {
                    const s = item;
                    return (
                      <button
                        key={s.ServicioId}
                        onClick={() => onSeleccionarItem({ ...s, tipo: 'servicio' })}
                        className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{s.Nombre}</span>
                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                              Servicio
                            </span>
                          </div>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Precio a definir
                          </span>
                        </div>
                        {s.Descripcion && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">{s.Descripcion}</p>
                        )}
                      </button>
                    );
                  }
                })}
              </div>
              {totalPaginasProducto > 1 && (
                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <div className="text-xs text-slate-500">
                    Mostrando {inicio + 1} - {Math.min(inicio + itemsPorPagina, itemsFiltrados.length)} de {itemsFiltrados.length}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onPaginaChange(p => Math.max(1, p - 1))}
                      disabled={paginaProducto === 1}
                      className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 text-sm"
                    >
                      Anterior
                    </button>
                    <span className="px-3 py-1 text-sm">{paginaProducto} / {totalPaginasProducto}</span>
                    <button
                      type="button"
                      onClick={() => onPaginaChange(p => Math.min(totalPaginasProducto, p + 1))}
                      disabled={paginaProducto === totalPaginasProducto}
                      className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 text-sm"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};