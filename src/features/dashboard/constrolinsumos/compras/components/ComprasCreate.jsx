import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Package, Palette, Plus, Trash2, ChevronLeft, ChevronRight as ChevronRightIcon, Loader2 } from "lucide-react";
import { ProductoColoresModal } from "../../../productos/components/ProductoColoresModal";
import { ComprasSelectProveedorSimple } from "../components/ComprasSelectProveedorSimple";
import { toast } from "react-toastify";

const formatPrice = (value) => {
  const num = Number(value);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ComprasCreate = ({
  formCrear,
  setFormCrear,
  detallesCrear,
  productos,
  colores = [],
  proveedores,
  errores,
  onBack,
  onSelectProducto,
  onActualizarDetalle,
  onAñadirDetalle,
  onEliminarDetalle,
  onCreate,
  getProductoDisplay,
  calcularTotal,
  isSubmitting
}) => {
  // Estados para paginación de artículos
  const [currentPageArticulos, setCurrentPageArticulos] = useState(1);
  const itemsPerPageArticulos = 3; // 3 artículos por página

  const [showColorModal, setShowColorModal] = useState(false);
  const [detalleIndexColor, setDetalleIndexColor] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [coloresTemp, setColoresTemp] = useState([]);

  useEffect(() => {
    if (!formCrear.FechaRegistro) {
      setFormCrear(prev => ({ ...prev, FechaRegistro: getTodayDate() }));
    }
  }, [formCrear.FechaRegistro, setFormCrear]);

  // Resetear a página 1 cuando se añade o elimina un artículo
  useEffect(() => {
    setCurrentPageArticulos(1);
  }, [detallesCrear.length]);

  // Calcular artículos a mostrar en la página actual
  const getCurrentPageArticulos = () => {
    const startIndex = (currentPageArticulos - 1) * itemsPerPageArticulos;
    const endIndex = startIndex + itemsPerPageArticulos;
    return detallesCrear.slice(startIndex, endIndex);
  };

  // Calcular total de páginas
  const totalPagesArticulos = Math.ceil(detallesCrear.length / itemsPerPageArticulos);

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPageArticulos(page);
  };

  const abrirSelectorColor = (index, producto) => {
    if (!producto) {
      toast.warning("Debe seleccionar un producto primero");
      return;
    }

    const usaColores = producto.UsaColores === 1 || producto.UsaColores === true || producto.UsaColores === "1";

    if (!usaColores) {
      toast.warning("Este producto no tiene configuración de colores");
      return;
    }

    setDetalleIndexColor(index);
    setProductoSeleccionado(producto);

    const coloresExistentes = detallesCrear[index]?.colores || [];

    if (!colores || colores.length === 0) {
      toast.warning("No hay colores disponibles");
      return;
    }

    const coloresCompletos = coloresExistentes.map(colorExistente => {
      const colorInfo = colores.find(c => c.ColorId === colorExistente.ColorId);
      return {
        ColorId: colorExistente.ColorId,
        Stock: Number(colorExistente.Stock) || 0,
        Nombre: colorInfo?.Nombre || colorExistente.Nombre || "Color",
        Hex: colorInfo?.Hex || colorExistente.Hex || "#CCCCCC"
      };
    });

    setColoresTemp(coloresCompletos);
    setShowColorModal(true);
  };

  const manejarSetColoresConStock = (nuevosColores) => {
    // Asegurar que nuevosColores es un array
    let coloresArray = Array.isArray(nuevosColores) ? nuevosColores : [];

    console.log("🎨 manejarSetColoresConStock - Recibido:", coloresArray);

    // Procesar cada color para asegurar que tiene Stock
    const coloresPlanos = coloresArray.map(color => ({
      ColorId: String(color.ColorId || color.colorId || ''),
      Stock: Number(color.Stock || color.stock || 0),  // 🔥 Asegurar Stock
      Nombre: String(color.Nombre || color.nombre || 'Color'),
      Hex: String(color.Hex || color.hex || '#CCCCCC')
    }));

    console.log("🎨 Colores procesados:", coloresPlanos);

    // Actualizar estado local
    setColoresTemp(coloresPlanos);

    // Actualizar el detalle si hay un índice seleccionado
    if (detalleIndexColor !== null) {
      // Calcular cantidad total
      const cantidadTotal = coloresPlanos.reduce((sum, c) => sum + (Number(c.Stock) || 0), 0);

      console.log("📦 Cantidad total:", cantidadTotal);

      // Actualizar colores en el detalle
      onActualizarDetalle(detalleIndexColor, "colores", coloresPlanos);
      // Actualizar cantidad total
      onActualizarDetalle(detalleIndexColor, "Cantidad", cantidadTotal);
      // Marcar que usa stock por color
      onActualizarDetalle(detalleIndexColor, "tipoStock", "colores");
    }
  };

  const guardarColoresDesdeModal = () => {
    if (detalleIndexColor !== null) {
      // 🔥 Asegurar que los colores tienen el stock correcto
      const coloresParaGuardar = coloresTemp.map(color => ({
        ColorId: String(color.ColorId || ''),
        Stock: Number(color.Stock || 0),  // 🔥 Asegurar que Stock es número
        Nombre: String(color.Nombre || 'Color'),
        Hex: String(color.Hex || '#CCCCCC')
      }));

      // Calcular cantidad total sumando todos los stocks
      const cantidadTotal = coloresParaGuardar.reduce((sum, c) => {
        return sum + (Number(c.Stock) || 0);
      }, 0);

      console.log("🎨 Guardando colores en detalle:", coloresParaGuardar);
      console.log("📦 Cantidad total calculada:", cantidadTotal);

      // Actualizar el detalle con los colores
      onActualizarDetalle(detalleIndexColor, "colores", coloresParaGuardar);
      onActualizarDetalle(detalleIndexColor, "Cantidad", cantidadTotal);
      onActualizarDetalle(detalleIndexColor, "tipoStock", "colores");

      // Cerrar modal
      setShowColorModal(false);
      setDetalleIndexColor(null);
      setProductoSeleccionado(null);
      setColoresTemp([]);
    }
  };

  const cerrarModalSinGuardar = () => {
    setShowColorModal(false);
    setDetalleIndexColor(null);
    setProductoSeleccionado(null);
    setColoresTemp([]);
  };

  const handleTipoStockChange = (index, tipo) => {
    onActualizarDetalle(index, "tipoStock", tipo);

    if (tipo === 'general') {
      onActualizarDetalle(index, "colores", []);
      onActualizarDetalle(index, "Cantidad", 1);
    } else if (tipo === 'colores') {
      const tieneColores = detallesCrear[index]?.colores?.length > 0;

      if (!tieneColores) {
        const productoId = detallesCrear[index]?.ProductoId;

        if (!productoId) {
          toast.error("Debe seleccionar un producto primero");
          onActualizarDetalle(index, "tipoStock", "general");
          return;
        }

        const producto = productos?.find(p => p.ProductoId === productoId);

        if (producto) {
          const usaColores = producto.UsaColores === 1 || producto.UsaColores === true || producto.UsaColores === "1";

          if (!usaColores) {
            toast.warning("Este producto no tiene configuración de colores");
            onActualizarDetalle(index, "tipoStock", "general");
            return;
          }

          abrirSelectorColor(index, producto);
        } else {
          toast.error("Error: Producto no encontrado en la lista");
          onActualizarDetalle(index, "tipoStock", "general");
        }
      }
    }
  };

  // Función para manejar cambios en cantidad
  const handleCantidadChange = (index, value) => {
    if (value === '') {
      onActualizarDetalle(index, "Cantidad", '');
      return;
    }
    const num = Number(value);
    if (num > 0) {
      onActualizarDetalle(index, "Cantidad", value);
    }
  };

  // Validar al perder el foco
  const handleCantidadBlur = (index, value) => {
    const num = Number(value);
    if (!value || isNaN(num) || num <= 0) {
      onActualizarDetalle(index, "Cantidad", 1);
    }
  };

  // Función para manejar cambios en precio unitario
  const handlePrecioChange = (index, value) => {
    if (value === '') {
      onActualizarDetalle(index, "PrecioUnitario", '');
      onActualizarDetalle(index, "Subtotal", 0);
      return;
    }
    const num = Number(value);
    if (num >= 0) {
      onActualizarDetalle(index, "PrecioUnitario", value);
      // Recalcular subtotal
      const cantidad = Number(detallesCrear[index].Cantidad) || 0;
      onActualizarDetalle(index, "Subtotal", num * cantidad);
    }
  };

  const handlePrecioBlur = (index, value) => {
    const num = Number(value);
    if (!value || isNaN(num) || num < 0) {
      onActualizarDetalle(index, "PrecioUnitario", 0);
      onActualizarDetalle(index, "Subtotal", 0);
    } else {
      // Formatear a 2 decimales
      onActualizarDetalle(index, "PrecioUnitario", num.toFixed(2));
      const cantidad = Number(detallesCrear[index].Cantidad) || 0;
      onActualizarDetalle(index, "Subtotal", (num * cantidad).toFixed(2));
    }
  };

  const currentArticulos = getCurrentPageArticulos();

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <h3 className="text-lg font-bold truncate">Nueva compra</h3>
        </div>

        {/* Errores */}
        {errores.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm max-h-24 overflow-y-auto">
            <ul className="list-disc pl-5">
              {errores.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        {/* Información General */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* PROVEEDOR CON SELECT SIMPLE */}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">Proveedor *</label>
            <ComprasSelectProveedorSimple
              proveedorId={formCrear.ProveedorId}
              nombreProveedor={formCrear.nombreProveedor}
              onSelectProveedor={(proveedor) => {
                setFormCrear(prev => ({
                  ...prev,
                  ProveedorId: proveedor?.ProveedorId || "",
                  nombreProveedor: proveedor?.NombreProveedor || ""
                }));
              }}
              error={errores.some(e => e.toLowerCase().includes('proveedor'))}
            />
          </div>

          {/* Fecha (solo lectura) */}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">Fecha de Registro</label>
            <input
              type="date"
              value={formCrear.FechaRegistro}
              onChange={(e) => setFormCrear(prev => ({ ...prev, FechaRegistro: e.target.value }))}
              className="h-10 px-3 border rounded-lg bg-white text-sm w-full"
              max={getTodayDate()}
            />
          </div>

          {/* Total */}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">Total (Calculado)</label>
            <input
              type="text"
              readOnly
              value={formatPrice(calcularTotal())}
              className="h-10 px-3 border rounded-lg bg-gray-100 font-medium text-sm w-full"
            />
          </div>
        </div>

        {/* Artículos de la Compra */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold">Artículos de la Compra</h4>
            <button
              type="button"
              onClick={onAñadirDetalle}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Plus size={14} />
              Agregar artículo
            </button>
          </div>

          {/* Encabezados */}
          <div className="grid grid-cols-12 gap-3 mb-2 px-2 text-xs font-medium text-gray-500">
            <div className="col-span-4">Producto</div>
            <div className="col-span-2">Tipo de Stock</div>
            <div className="col-span-2 text-center">Cantidad</div>
            <div className="col-span-2 text-right">Precio Unit.</div>
            <div className="col-span-1 text-right">Subtotal</div>
            <div className="col-span-1"></div>
          </div>

          {/* Contenedor de artículos - Sin altura fija */}
          <div className="space-y-3">
            {currentArticulos.length > 0 ? (
              currentArticulos.map((d, index) => {
                // Calcular el índice real en el array completo
                const realIndex = (currentPageArticulos - 1) * itemsPerPageArticulos + index;
                const producto = productos.find(p => p.ProductoId === d.ProductoId);
                const tieneProducto = !!d.ProductoId;
                const usaColores = producto?.UsaColores === 1 || producto?.UsaColores === true || producto?.UsaColores === "1";
                const tipoStock = d.tipoStock || (usaColores ? 'colores' : 'general');
                const tieneColores = d.colores && d.colores.length > 0;

                return (
                  <div key={realIndex} className="bg-gray-50 border rounded-lg p-4">
                    {/* Fila principal */}
                    <div className="grid grid-cols-12 gap-3 items-start">
                      {/* Producto */}
                      <div className="col-span-4">
                        <button
                          type="button"
                          onClick={() => onSelectProducto("create", realIndex)}
                          className={`w-full text-left flex items-center gap-2 p-2 rounded-lg border h-10 ${tieneProducto
                            ? 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100'
                            : 'border-dashed border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50'
                            }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${tieneProducto ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}>
                            <Package size={12} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-xs truncate ${tieneProducto ? 'text-emerald-800' : 'text-gray-500'
                              }`}>
                              {producto?.Nombre || "Seleccionar producto"}
                            </p>
                            {producto?.SKU && (
                              <p className="text-[10px] text-gray-500 truncate">SKU: {producto.SKU}</p>
                            )}
                          </div>
                          <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
                        </button>
                      </div>

                      {/* Tipo de stock */}
                      <div className="col-span-2">
                        {tieneProducto ? (
                          <select
                            value={tipoStock}
                            onChange={(e) => handleTipoStockChange(realIndex, e.target.value)}
                            className="w-full h-10 px-2 border rounded-lg text-xs bg-white"
                          >
                            <option value="general">Stock General</option>
                            <option value="colores">Stock por Color</option>
                          </select>
                        ) : (
                          <div className="h-10 px-2 border rounded-lg bg-gray-100 flex items-center text-xs text-gray-400">
                            -
                          </div>
                        )}
                      </div>

                      {/* Cantidad */}
                      <div className="col-span-2">
                        {tieneProducto ? (
                          tipoStock === 'general' ? (
                            <input
                              type="number"
                              value={d.Cantidad ?? 1}
                              onChange={(e) => handleCantidadChange(realIndex, e.target.value)}
                              onBlur={(e) => handleCantidadBlur(realIndex, e.target.value)}
                              className="w-full h-10 px-2 border rounded-lg text-xs text-center"
                              placeholder="1"
                              min="1"
                              step="1"
                            />
                          ) : (
                            <input
                              type="number"
                              value={d.Cantidad || 0}
                              className="w-full h-10 px-2 border rounded-lg text-xs text-center bg-gray-100"
                              disabled
                              readOnly
                              placeholder="0"
                            />
                          )
                        ) : (
                          <div className="h-10 px-2 border rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                            -
                          </div>
                        )}
                      </div>

                      {/* Precio Unitario */}
                      <div className="col-span-2">
                        {tieneProducto ? (
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                              $
                            </span>
                            <input
                              type="number"
                              value={d.PrecioUnitario ?? 0}
                              onChange={(e) => handlePrecioChange(realIndex, e.target.value)}
                              onBlur={(e) => handlePrecioBlur(realIndex, e.target.value)}
                              className="w-full h-10 pl-6 pr-2 border rounded-lg text-xs text-right"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        ) : (
                          <div className="h-10 px-2 border rounded-lg bg-gray-100 flex items-center justify-end text-xs text-gray-400">
                            -
                          </div>
                        )}
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-1 flex items-center justify-end h-10">
                        {tieneProducto ? (
                          <span className="text-xs font-semibold text-blue-700">
                            {formatPrice(d.Subtotal)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>

                      {/* Botón eliminar */}
                      <div className="col-span-1 flex justify-end">
                        {detallesCrear.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              onEliminarDetalle(realIndex);
                              // Si después de eliminar, la página actual se queda vacía, ir a la anterior
                              if (currentArticulos.length === 1 && currentPageArticulos > 1) {
                                setCurrentPageArticulos(currentPageArticulos - 1);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                            title="Eliminar artículo"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Selector de colores */}
                    {tieneProducto && tipoStock === 'colores' && (
                      <div className="mt-3">
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-4">
                            <div className="text-xs font-medium text-gray-500 mb-1">Color</div>
                            <button
                              type="button"
                              onClick={() => {
                                if (producto) {
                                  abrirSelectorColor(realIndex, producto);
                                } else {
                                  toast.error("Debe seleccionar un producto primero");
                                  onActualizarDetalle(realIndex, "tipoStock", "general");
                                }
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border w-full ${tieneColores
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-dashed border-gray-300 bg-white hover:border-purple-400'
                                }`}
                            >
                              <Palette size={16} className={tieneColores ? 'text-purple-600' : 'text-gray-400'} />
                              <span className={`text-xs ${tieneColores ? 'text-purple-800 font-medium' : 'text-gray-500'
                                }`}>
                                {tieneColores
                                  ? `${d.colores.length} colores seleccionados`
                                  : 'Seleccionar colores'
                                }
                              </span>
                              <ChevronRight size={14} className="text-gray-400 ml-auto" />
                            </button>
                          </div>

                          {/* Mostrar colores seleccionados */}
                          {tieneColores && (
                            <div className="col-span-8">
                              <div className="text-xs font-medium text-gray-500 mb-1">Colores seleccionados</div>
                              <div className="flex flex-wrap gap-2">
                                {d.colores.map(color => (
                                  <div
                                    key={color.ColorId}
                                    className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border"
                                    title={`${color.Nombre}: ${color.Stock} unidades`}
                                  >
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.Hex }} />
                                    <span className="font-medium">{color.Nombre}</span>
                                    <span className="text-gray-500 ml-1">({color.Stock})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Descripción */}
                    {tieneProducto && (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={d.Descripcion || ''}
                          onChange={(e) => onActualizarDetalle(realIndex, "Descripcion", e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Descripción adicional (opcional)"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                No hay artículos agregados. Haz clic en "Agregar artículo" para comenzar.
              </div>
            )}
          </div>

          {/* PAGINACIÓN - Solo visible cuando hay más de 3 artículos */}
          {totalPagesArticulos > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Mostrando {currentArticulos.length} de {detallesCrear.length} artículos
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPageArticulos - 1)}
                  disabled={currentPageArticulos <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPagesArticulos }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-full text-sm ${currentPageArticulos === page
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPageArticulos + 1)}
                  disabled={currentPageArticulos >= totalPagesArticulos}
                  className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                >
                  Siguiente
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Total y botones */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg mb-4 border border-emerald-200">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-emerald-800">Total:</span>
            <span className="text-xl font-bold text-emerald-700">
              {formatPrice(calcularTotal())}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCreate}
            disabled={isSubmitting}
            className={`flex-1 h-11 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg transition-all font-medium text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-emerald-600 hover:to-green-600'}`}
          >
            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
            {isSubmitting ? 'Creando...' : 'Crear Compra'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex-1 h-11 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Modal para seleccionar colores */}
      <ProductoColoresModal
        open={showColorModal}
        onClose={cerrarModalSinGuardar}
        colores={colores}
        coloresConStock={coloresTemp}
        setColoresConStock={manejarSetColoresConStock}
        onGuardar={guardarColoresDesdeModal}
      />
    </>
  );
};