import React, { useState, useMemo } from "react";
import Modal from "../../components/modals/modal.jsx";
import { Search, Check, X, Palette, ChevronDown, ChevronUp } from "lucide-react";

export const ProductoColoresModal = ({
  open,
  onClose,
  colores,
  coloresConStock,
  setColoresConStock,
}) => {
  const [busqueda, setBusqueda] = useState("");
  const [activeTab, setActiveTab] = useState("todos"); // 'todos' o 'seleccionados'
  const [expandirResumen, setExpandirResumen] = useState(false);

  // Colores filtrados por búsqueda
  const coloresFiltrados = useMemo(() => {
    if (!busqueda.trim()) return colores;

    const busquedaLower = busqueda.toLowerCase();
    return colores.filter(color =>
      color.Nombre.toLowerCase().includes(busquedaLower) ||
      color.Hex.toLowerCase().includes(busquedaLower)
    );
  }, [colores, busqueda]);

  // Ordenar colores: primero los seleccionados, luego el resto
  const coloresOrdenados = useMemo(() => {
    return [...coloresFiltrados].sort((a, b) => {
      const aSelected = coloresConStock.some(c => c.ColorId === a.ColorId);
      const bSelected = coloresConStock.some(c => c.ColorId === b.ColorId);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.Nombre.localeCompare(b.Nombre);
    });
  }, [coloresFiltrados, coloresConStock]);

  // Colores seleccionados para la pestaña
  const coloresSeleccionadosList = useMemo(() => {
    return colores
      .filter(color => coloresConStock.some(c => c.ColorId === color.ColorId))
      .map(color => ({
        ...color,
        Stock: coloresConStock.find(c => c.ColorId === color.ColorId)?.Stock || 0
      }));
  }, [colores, coloresConStock]);

  const handleStockChange = (colorId, nuevoStock) => {
    // Permitir vacío o números
    if (nuevoStock === "") {
      setColoresConStock(prev =>
        prev.map(c =>
          c.ColorId === colorId
            ? { ...c, Stock: "" }
            : c
        )
      );
    } else {
      const stockNumero = parseInt(nuevoStock, 10);
      if (!isNaN(stockNumero) && stockNumero >= 0) {
        setColoresConStock(prev =>
          prev.map(c =>
            c.ColorId === colorId
              ? { ...c, Stock: stockNumero }
              : c
          )
        );
      }
    }
  };

  const handleBlurStock = (colorId) => {
    setColoresConStock(prev =>
      prev.map(c =>
        c.ColorId === colorId
          ? { ...c, Stock: c.Stock === "" ? 0 : parseInt(c.Stock) || 0 }
          : c
      )
    );
  };

  const seleccionarColor = (color) => {
    setColoresConStock(prev => [
      ...prev,
      {
        ColorId: color.ColorId,
        Stock: 0,
        Nombre: color.Nombre,
        Hex: color.Hex
      }
    ]);
  };

  const deseleccionarColor = (colorId) => {
    setColoresConStock(prev =>
      prev.filter(c => c.ColorId !== colorId)
    );
  };

  const stockTotal = useMemo(() => {
    return coloresConStock.reduce((sum, c) => sum + (parseInt(c.Stock) || 0), 0);
  }, [coloresConStock]);

  const coloresSinStock = useMemo(() => {
    return coloresConStock.filter(c => parseInt(c.Stock) === 0).length;
  }, [coloresConStock]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 bg-white rounded-xl w-[550px] max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-800">
                Gestión de Colores
              </h3>
              <p className="text-sm text-gray-500">
                Asigna stock por color
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "todos"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("todos")}
          >
            Todos los colores
            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
              {colores.length}
            </span>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "seleccionados"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("seleccionados")}
          >
            Seleccionados
            {coloresConStock.length > 0 && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                {coloresConStock.length}
              </span>
            )}
          </button>
        </div>

        {/* Buscador - Solo en pestaña "todos" */}
        {activeTab === "todos" && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar color por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Lista de colores */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          {activeTab === "todos" ? (
            // PESTAÑA: TODOS LOS COLORES
            coloresOrdenados.length > 0 ? (
              <div className="space-y-2">
                {coloresOrdenados.map(color => {
                  const colorSeleccionado = coloresConStock.find(c => c.ColorId === color.ColorId);
                  const stockActual = colorSeleccionado?.Stock ?? "";

                  return (
                    <div
                      key={color.ColorId}
                      className={`p-3 rounded-lg border transition-all ${colorSeleccionado
                        ? "bg-blue-50/50 border-blue-200"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative">
                            <span
                              className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: color.Hex }}
                            />
                            {colorSeleccionado && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">
                                {color.Nombre}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                {color.Hex}
                              </span>
                            </div>
                          </div>
                        </div>

                        {colorSeleccionado ? (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Stock:</span>
                              <input
                                type="number"
                                min="0"
                                value={stockActual}
                                onChange={(e) => handleStockChange(color.ColorId, e.target.value)}
                                onBlur={() => handleBlurStock(color.ColorId)}
                                className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                              />
                            </div>
                            <button
                              onClick={() => deseleccionarColor(color.ColorId)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Quitar color"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => seleccionarColor(color)}
                            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Seleccionar
                          </button>
                        )}
                      </div>

                      {colorSeleccionado && parseInt(stockActual) === 0 && (
                        <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                          Stock en 0 - No disponible para venta
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No se encontraron colores</p>
                <p className="text-sm text-gray-500 mt-1">
                  Intenta con otra búsqueda
                </p>
              </div>
            )
          ) : (
            // PESTAÑA: COLORES SELECCIONADOS
            coloresSeleccionadosList.length > 0 ? (
              <div className="space-y-2">
                {coloresSeleccionadosList.map(color => {
                  const stockActual = coloresConStock.find(c => c.ColorId === color.ColorId)?.Stock ?? "";

                  return (
                    <div
                      key={color.ColorId}
                      className="p-3 rounded-lg border border-blue-200 bg-blue-50/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: color.Hex }}
                          />
                          <div>
                            <span className="font-medium text-gray-800">
                              {color.Nombre}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              {color.Hex}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Stock:</span>
                            <input
                              type="number"
                              min="0"
                              value={stockActual}
                              onChange={(e) => handleStockChange(color.ColorId, e.target.value)}
                              onBlur={() => handleBlurStock(color.ColorId)}
                              className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </div>
                          <button
                            onClick={() => deseleccionarColor(color.ColorId)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Quitar color"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No hay colores seleccionados</p>
                <p className="text-sm text-gray-500 mt-1">
                  Ve a "Todos los colores" para asignar stock
                </p>
              </div>
            )
          )}
        </div>

        {/* Footer con resumen y acciones */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Resumen rápido */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{coloresConStock.length}</span> colores
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{stockTotal}</span> uds totales
                </span>
              </div>
              {coloresSinStock > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{coloresSinStock}</span> sin stock
                  </span>
                </div>
              )}
            </div>

            {coloresConStock.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("¿Estás seguro de eliminar todos los colores asignados?")) {
                    setColoresConStock([]);
                  }
                }}
                className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar todo
              </button>
            )}
          </div>

          {/* Resumen detallado (expandible) */}
          {coloresConStock.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => setExpandirResumen(!expandirResumen)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                {expandirResumen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                {expandirResumen ? "Ocultar detalle" : "Ver detalle por color"}
              </button>

              {expandirResumen && (
                <div className="mt-2 grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  {coloresConStock.map(color => (
                    <div key={color.ColorId} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color.Hex }}
                        />
                        <span className="text-gray-600">{color.Nombre}:</span>
                      </div>
                      <span className={`font-medium ${parseInt(color.Stock) === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {parseInt(color.Stock) || 0} uds
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2"
              onClick={() => {
                // Si no hay colores seleccionados, forzar cambio a stock general
                if (coloresConStock.length === 0) {
                  // Esto lo manejará el useEffect del ProductoForm
                }
                onClose();
              }}
            >
              <Check className="w-4 h-4" />
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};