import React from "react";
import Modal from "../../components/modals/modal.jsx";

export const ProductoColoresModal = ({
  open,
  onClose,
  colores,
  coloresConStock,
  setColoresConStock,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 bg-white rounded-xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs">C</div>
          Gestión de Colores y Stock
        </h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Asigne colores al producto y defina el stock disponible para cada color.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {colores.map(color => {
            const colorSeleccionado = coloresConStock.find(c => c.ColorId === color.ColorId);
            const stockActual = colorSeleccionado ? colorSeleccionado.Stock : 0;

            return (
              <div key={color.ColorId} className="mb-3 p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!colorSeleccionado}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setColoresConStock(prev => [
                            ...prev,
                            {
                              ColorId: color.ColorId,
                              Stock: 0,
                              Nombre: color.Nombre,
                              Hex: color.Hex
                            }
                          ]);
                        } else {
                          setColoresConStock(prev =>
                            prev.filter(c => c.ColorId !== color.ColorId)
                          );
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <span
                        className="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: color.Hex }}
                        title={color.Nombre}
                      />
                      <div>
                        <span className="text-sm font-medium">{color.Nombre}</span>
                        <div className="text-xs text-gray-500">{color.Hex}</div>
                      </div>
                    </div>
                  </div>

                  {colorSeleccionado && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <input
                        type="number"
                        min="0"
                        value={stockActual}
                        onChange={(e) => {
                          const nuevoStock = parseInt(e.target.value) || 0;
                          setColoresConStock(prev =>
                            prev.map(c =>
                              c.ColorId === color.ColorId
                                ? { ...c, Stock: nuevoStock }
                                : c
                            )
                          );
                        }}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Cantidad"
                      />
                    </div>
                  )}
                </div>

                {colorSeleccionado && stockActual === 0 && (
                  <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                    ⚠️ Stock en 0. El producto con este color no estará disponible para venta.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-sm font-medium">
                Colores seleccionados: {coloresConStock.length}
              </span>
              <div className="text-xs text-gray-500 mt-1">
                Stock total: {coloresConStock.reduce((sum, c) => sum + (c.Stock || 0), 0)} unidades
              </div>
            </div>
            {coloresConStock.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("¿Limpiar todos los colores y stock?")) {
                    setColoresConStock([]);
                  }
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Limpiar todo
              </button>
            )}
          </div>

          {coloresConStock.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Resumen de stock por color:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {coloresConStock.map(color => (
                  <div key={color.ColorId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.Hex }}
                      />
                      <span>{color.Nombre}:</span>
                    </div>
                    <span className={`font-medium ${color.Stock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {color.Stock} unidades
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            Guardar ({coloresConStock.length} colores)
          </button>
        </div>
      </div>
    </Modal>
  );
};