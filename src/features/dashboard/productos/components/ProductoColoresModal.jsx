import React, { useState, useMemo, useEffect } from "react";
import Modal from "../../components/modals/modal.jsx";
import { Search, Check, X, Palette, ChevronDown, ChevronUp, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

export const ProductoColoresModal = ({
  open,
  onClose,
  colores,
  coloresConStock = [],  // Estado inicial del padre
  setColoresConStock,    // Función para actualizar el padre
}) => {
  const [busqueda, setBusqueda] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [expandirResumen, setExpandirResumen] = useState(false);
  const [errorStock, setErrorStock] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const coloresPorPagina = 10;

  // 🔥 ESTADO LOCAL para los colores seleccionados con stock
  const [coloresSeleccionadosLocal, setColoresSeleccionadosLocal] = useState([]);

  // 🔥 Sincronizar con el padre cuando se abre el modal
  useEffect(() => {
    if (open) {
      // Copiar los colores del padre al estado local
      const coloresIniciales = coloresConStock.map(color => ({
        ColorId: color.ColorId,
        Stock: Number(color.Stock) || 0,
        Nombre: color.Nombre,
        Hex: color.Hex
      }));
      setColoresSeleccionadosLocal(coloresIniciales);
      setErrorStock("");
      setBusqueda("");
      setActiveTab("todos");
      setPaginaActual(1);
    }
  }, [open, coloresConStock]);

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
      const aSelected = coloresSeleccionadosLocal.some(c => c.ColorId === a.ColorId);
      const bSelected = coloresSeleccionadosLocal.some(c => c.ColorId === b.ColorId);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.Nombre.localeCompare(b.Nombre);
    });
  }, [coloresFiltrados, coloresSeleccionadosLocal]);

  // Calcular paginación
  const totalPaginas = useMemo(() => {
    return Math.ceil(coloresOrdenados.length / coloresPorPagina);
  }, [coloresOrdenados.length]);

  const coloresPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * coloresPorPagina;
    const fin = inicio + coloresPorPagina;
    return coloresOrdenados.slice(inicio, fin);
  }, [coloresOrdenados, paginaActual]);

  // Resetear página cuando cambia la búsqueda
  const resetearPaginacion = () => {
    setPaginaActual(1);
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
    resetearPaginacion();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetearPaginacion();
  };

  // Colores seleccionados para la pestaña
  const coloresSeleccionadosList = useMemo(() => {
    return colores
      .filter(color => coloresSeleccionadosLocal.some(c => c.ColorId === color.ColorId))
      .map(color => ({
        ...color,
        Stock: coloresSeleccionadosLocal.find(c => c.ColorId === color.ColorId)?.Stock || 0
      }));
  }, [colores, coloresSeleccionadosLocal]);

  // Validar que todos los colores seleccionados tengan stock > 0
  const validarStocks = () => {
    if (coloresSeleccionadosLocal.length === 0) {
      setErrorStock("Debes seleccionar al menos un color");
      return false;
    }

    const coloresSinStock = coloresSeleccionadosLocal.filter(c => parseInt(c.Stock) === 0);
    if (coloresSinStock.length > 0) {
      setErrorStock(`Los siguientes colores deben tener stock mínimo 1: ${
        coloresSinStock.map(c => c.Nombre).join(", ")
      }`);
      return false;
    }

    setErrorStock("");
    return true;
  };

  // 🔥 FUNCIÓN PARA ACTUALIZAR STOCK DE UN COLOR EN ESTADO LOCAL
  const handleStockChange = (colorId, nuevoStock) => {
    setErrorStock("");
    
    if (nuevoStock === "") {
      setColoresSeleccionadosLocal(prev =>
        prev.map(c =>
          c.ColorId === colorId
            ? { ...c, Stock: "" }
            : c
        )
      );
    } else {
      const stockNumero = parseInt(nuevoStock, 10);
      if (!isNaN(stockNumero) && stockNumero >= 0) {
        setColoresSeleccionadosLocal(prev =>
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
    setColoresSeleccionadosLocal(prev =>
      prev.map(c =>
        c.ColorId === colorId
          ? { ...c, Stock: c.Stock === "" ? 0 : parseInt(c.Stock) || 0 }
          : c
      )
    );
  };

  // 🔥 FUNCIÓN PARA SELECCIONAR UN COLOR
  const seleccionarColor = (color) => {
    setErrorStock("");
    
    const yaSeleccionado = coloresSeleccionadosLocal.some(c => c.ColorId === color.ColorId);
    
    if (!yaSeleccionado) {
      setColoresSeleccionadosLocal(prev => [
        ...prev,
        {
          ColorId: color.ColorId,
          Stock: 1,
          Nombre: color.Nombre,
          Hex: color.Hex
        }
      ]);
    }
  };

  // 🔥 FUNCIÓN PARA DESELECCIONAR UN COLOR
  const deseleccionarColor = (colorId) => {
    setErrorStock("");
    setColoresSeleccionadosLocal(prev =>
      prev.filter(c => c.ColorId !== colorId)
    );
  };

  // 🔥 FUNCIÓN PARA LIMPIAR TODOS LOS COLORES
  const limpiarTodos = () => {
    if (window.confirm("¿Estás seguro de eliminar todos los colores asignados?")) {
      setColoresSeleccionadosLocal([]);
      setErrorStock("");
    }
  };

  const stockTotal = useMemo(() => {
    return coloresSeleccionadosLocal.reduce((sum, c) => sum + (parseInt(c.Stock) || 0), 0);
  }, [coloresSeleccionadosLocal]);

  const coloresSinStock = useMemo(() => {
    return coloresSeleccionadosLocal.filter(c => parseInt(c.Stock) === 0).length;
  }, [coloresSeleccionadosLocal]);

  // 🔥 GUARDAR Y CERRAR - Actualizar el padre con los cambios
  const handleGuardar = () => {
    if (validarStocks()) {
      // Preparar los colores para guardar
      const coloresParaGuardar = coloresSeleccionadosLocal.map(color => ({
        ColorId: color.ColorId,
        Stock: Number(color.Stock) || 0,
        Nombre: color.Nombre,
        Hex: color.Hex
      }));
      
      // 🔥 Actualizar el estado del padre
      setColoresConStock(coloresParaGuardar);
      
      // Cerrar el modal
      onClose();
    }
  };

  // 🔥 CANCELAR - Cerrar sin guardar cambios
  const handleCancelar = () => {
    onClose();
  };

  // Componente de paginación
  const Paginacion = ({ total, actual, onChange }) => {
    if (total <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Mostrando {(actual - 1) * coloresPorPagina + 1} - {Math.min(actual * coloresPorPagina, coloresOrdenados.length)} de {coloresOrdenados.length} colores
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(actual - 1)}
            disabled={actual === 1}
            className={`p-2 rounded-lg border transition-all ${
              actual === 1
                ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, total) }, (_, i) => {
              let pageNum;
              if (total <= 5) {
                pageNum = i + 1;
              } else if (actual <= 3) {
                pageNum = i + 1;
              } else if (actual >= total - 2) {
                pageNum = total - 4 + i;
              } else {
                pageNum = actual - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    actual === pageNum
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onChange(actual + 1)}
            disabled={actual === total}
            className={`p-2 rounded-lg border transition-all ${
              actual === total
                ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <Modal open={open} onClose={handleCancelar}>
      <div className="p-6 bg-white rounded-xl w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
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
                Asigna stock por color (mínimo 1 por color)
              </p>
            </div>
          </div>
          <button
            onClick={handleCancelar}
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
            onClick={() => handleTabChange("todos")}
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
            onClick={() => handleTabChange("seleccionados")}
          >
            Seleccionados
            {coloresSeleccionadosLocal.length > 0 && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                {coloresSeleccionadosLocal.length}
              </span>
            )}
          </button>
        </div>

        {/* Buscador */}
        {activeTab === "todos" && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar color por nombre o código..."
              value={busqueda}
              onChange={handleBusquedaChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        )}

        {/* Mensaje de error */}
        {errorStock && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{errorStock}</p>
          </div>
        )}

        {/* Lista de colores */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          {activeTab === "todos" ? (
            coloresOrdenados.length > 0 ? (
              <div className="space-y-2">
                {coloresPaginados.map(color => {
                  const colorSeleccionado = coloresSeleccionadosLocal.find(c => c.ColorId === color.ColorId);
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
                                min="1"
                                value={stockActual}
                                onChange={(e) => handleStockChange(color.ColorId, e.target.value)}
                                onBlur={() => handleBlurStock(color.ColorId)}
                                className={`w-20 px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  parseInt(stockActual) === 0 ? "border-red-300 bg-red-50" : "border-gray-200"
                                }`}
                                placeholder="1"
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
                  const stockActual = coloresSeleccionadosLocal.find(c => c.ColorId === color.ColorId)?.Stock ?? "";

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
                              min="1"
                              value={stockActual}
                              onChange={(e) => handleStockChange(color.ColorId, e.target.value)}
                              onBlur={() => handleBlurStock(color.ColorId)}
                              className={`w-20 px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                parseInt(stockActual) === 0 ? "border-red-300 bg-red-50" : "border-gray-200"
                              }`}
                              placeholder="1"
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

        {/* Paginación */}
        {activeTab === "todos" && coloresOrdenados.length > coloresPorPagina && (
          <Paginacion 
            total={totalPaginas} 
            actual={paginaActual} 
            onChange={setPaginaActual} 
          />
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{coloresSeleccionadosLocal.length}</span> colores
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
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{coloresSinStock}</span> sin stock
                  </span>
                </div>
              )}
            </div>

            {coloresSeleccionadosLocal.length > 0 && (
              <button
                onClick={limpiarTodos}
                className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar todo
              </button>
            )}
          </div>

          {/* Resumen detallado */}
          {coloresSeleccionadosLocal.length > 0 && (
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
                  {coloresSeleccionadosLocal.map(color => (
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
              onClick={handleGuardar}
            >
              <Check className="w-4 h-4" />
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={handleCancelar}
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