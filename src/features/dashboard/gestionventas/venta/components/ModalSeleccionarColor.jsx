import React from 'react';
import { Search } from 'lucide-react';
import Modal from '../../../components/modals/modal.jsx';

export const ModalSeleccionarColor = ({
  open,
  onClose,
  busqueda,
  onBusquedaChange,
  coloresFiltrados,
  paginaColor,
  totalPaginasColor,
  onPaginaChange,
  onSeleccionarColor,
  coloresPorProducto,
  stockColores,
  productoActual,
  colorSeleccionadoId,
}) => {
  const coloresPorPagina = 12;
  const inicio = (paginaColor - 1) * coloresPorPagina;
  const coloresPaginados = coloresFiltrados.slice(inicio, inicio + coloresPorPagina);

  if (!productoActual?.ItemId) {
    return (
      <Modal open={open} onClose={onClose}>
        <div className="w-[600px] p-6 text-center">
          <p className="text-slate-500">Seleccione un producto primero</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[700px] p-6">
        <h3 className="text-lg font-bold mb-4">Seleccionar Color</h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar color..."
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
            {coloresFiltrados.length} {coloresFiltrados.length === 1 ? 'color' : 'colores'}
          </span>
        </div>
        <div className="h-[400px] overflow-y-auto border border-slate-200 rounded-lg p-3">
          {coloresFiltrados.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-slate-500">
                {busqueda ? "No hay colores que coincidan" : "Este producto no tiene colores disponibles"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {coloresPaginados.map(c => {
                  const key = `${productoActual.ItemId}_${c.ColorId}`;
                  const stockColor = stockColores[key] || 0;
                  return (
                    <button
                      key={c.ColorId}
                      onClick={() => onSeleccionarColor(c)}
                      className={`p-4 border rounded-lg hover:bg-slate-50 flex flex-col items-center text-center ${
                        stockColor === 0 ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
                      } ${
                        colorSeleccionadoId === c.ColorId
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-slate-200'
                      }`}
                      disabled={stockColor === 0}
                    >
                      <div
                        className="w-12 h-12 rounded-full border-2 border-slate-200 mb-2 shadow-sm"
                        style={{ backgroundColor: c.Hex }}
                      />
                      <span className="text-sm font-medium truncate w-full">{c.Nombre}</span>
                      {stockColor > 0 ? (
                        <span className="mt-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Stock: {stockColor}
                        </span>
                      ) : (
                        <span className="mt-1 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                          Agotado
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {totalPaginasColor > 1 && (
                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <div className="text-xs text-slate-500">
                    Mostrando {inicio + 1} - {Math.min(inicio + coloresPorPagina, coloresFiltrados.length)} de {coloresFiltrados.length}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onPaginaChange(p => Math.max(1, p - 1))}
                      disabled={paginaColor === 1}
                      className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 text-sm"
                    >
                      Anterior
                    </button>
                    <span className="px-3 py-1 text-sm">{paginaColor} / {totalPaginasColor}</span>
                    <button
                      type="button"
                      onClick={() => onPaginaChange(p => Math.min(totalPaginasColor, p + 1))}
                      disabled={paginaColor === totalPaginasColor}
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