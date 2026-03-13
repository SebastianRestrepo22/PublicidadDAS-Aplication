import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Package, Palette, Trash2 } from "lucide-react";
import { ProductoColoresModal } from "../../../productos/components/ProductoColoresModal";
import { ComprasSelectProveedorSimple } from "../components/ComprasSelectProveedorSimple";
import { toast } from "react-toastify";  // ← IMPORTANTE: Agregar esta línea

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
  calcularTotal
}) => {

  // 🔥 LOGS PARA DEPURAR
  console.log("📦 [ComprasCreate] productos recibidos:", productos);
  console.log("📦 [ComprasCreate] cantidad de productos:", productos?.length);
  console.log("📦 [ComprasCreate] tipo de productos:", typeof productos);
  console.log("📦 [ComprasCreate] ¿es array?", Array.isArray(productos));

  if (productos && productos.length > 0) {
    console.log("📦 [ComprasCreate] primer producto:", productos[0]);
    console.log("📦 [ComprasCreate] IDs de productos:", productos.map(p => p.ProductoId));
  }

  const [showColorModal, setShowColorModal] = useState(false);
  const [detalleIndexColor, setDetalleIndexColor] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [coloresTemp, setColoresTemp] = useState([]);

  useEffect(() => {
    console.log("Colores recibidos en ComprasCreate:", colores);
  }, [colores]);

  useEffect(() => {
    if (!formCrear.FechaRegistro) {
      setFormCrear(prev => ({ ...prev, FechaRegistro: getTodayDate() }));
    }
  }, [formCrear.FechaRegistro, setFormCrear]);

  const abrirSelectorColor = (index, producto) => {
    console.log("🔵 abrirSelectorColor llamado con:", { index, producto });
    console.log("🔵 Colores disponibles en BD:", colores);

    if (!producto) {
      console.warn("⚠️ No hay producto seleccionado");
      toast.warning("Debe seleccionar un producto primero");
      return;
    }

    // Verificar si el producto usa colores
    const usaColores = producto.UsaColores === 1 || producto.UsaColores === true || producto.UsaColores === "1";
    console.log("🔵 ¿Producto usa colores?", usaColores);

    if (!usaColores) {
      console.warn("⚠️ Este producto no usa colores");
      toast.warning("Este producto no tiene configuración de colores");
      return;
    }

    setDetalleIndexColor(index);
    setProductoSeleccionado(producto);

    const coloresExistentes = detallesCrear[index]?.colores || [];
    console.log("🔵 coloresExistentes en detalle:", coloresExistentes);

    // Verificar si hay colores disponibles en la BD
    if (!colores || colores.length === 0) {
      console.warn("⚠️ No hay colores disponibles en la base de datos");
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

    console.log("🔵 coloresCompletos a enviar al modal:", coloresCompletos);
    setColoresTemp(coloresCompletos);
    setShowColorModal(true);
    console.log("🔵 showColorModal cambiado a:", true);
  };

  const manejarSetColoresConStock = (nuevosColores) => {
    console.log("manejarSetColoresConStock recibió:", nuevosColores);

    let coloresArray;

    if (typeof nuevosColores === 'function') {
      console.log("Es una función, ejecutando con coloresTemp:", coloresTemp);
      coloresArray = nuevosColores(coloresTemp);
    } else {
      coloresArray = nuevosColores;
    }

    if (!Array.isArray(coloresArray)) {
      console.error("Error: coloresArray no es un array", coloresArray);
      coloresArray = [];
    }

    const coloresPlanos = coloresArray.map(color => ({
      ColorId: String(color.ColorId || color.colorId || ''),
      Stock: Number(color.Stock || color.stock || 0),
      Nombre: String(color.Nombre || color.nombre || 'Color'),
      Hex: String(color.Hex || color.hex || '#CCCCCC')
    }));

    console.log("Colores planos:", coloresPlanos);

    setColoresTemp(coloresPlanos);

    if (detalleIndexColor !== null) {
      const cantidadTotal = coloresPlanos.reduce((sum, c) => {
        return sum + (Number(c.Stock) || 0);
      }, 0);

      onActualizarDetalle(detalleIndexColor, "colores", coloresPlanos);
      onActualizarDetalle(detalleIndexColor, "Cantidad", cantidadTotal);
    }
  };

  const guardarColoresDesdeModal = () => {
    console.log("guardarColoresDesdeModal llamado, coloresTemp actuales:", coloresTemp);

    if (detalleIndexColor !== null) {
      const coloresParaGuardar = coloresTemp.map(color => {
        return {
          ColorId: String(color.ColorId || ''),
          Stock: Number(color.Stock || 0),
          Nombre: String(color.Nombre || 'Color'),
          Hex: String(color.Hex || '#CCCCCC')
        };
      });

      console.log("Colores para guardar (objetos planos):", coloresParaGuardar);

      const cantidadTotal = coloresParaGuardar.reduce((sum, c) => {
        return sum + (Number(c.Stock) || 0);
      }, 0);

      onActualizarDetalle(detalleIndexColor, "colores", coloresParaGuardar);
      onActualizarDetalle(detalleIndexColor, "Cantidad", cantidadTotal);
      onActualizarDetalle(detalleIndexColor, "tipoStock", "colores");

      setShowColorModal(false);
      setDetalleIndexColor(null);
      setProductoSeleccionado(null);
      setColoresTemp([]);
    }
  };

  const cerrarModalSinGuardar = () => {
    console.log("Cerrando modal sin guardar");
    setShowColorModal(false);
    setDetalleIndexColor(null);
    setProductoSeleccionado(null);
    setColoresTemp([]);
  };

  const handleTipoStockChange = (index, tipo) => {
    console.log("handleTipoStockChange:", { index, tipo });

    // Actualizar el tipo de stock primero
    onActualizarDetalle(index, "tipoStock", tipo);

    if (tipo === 'general') {
      onActualizarDetalle(index, "colores", []);
      onActualizarDetalle(index, "Cantidad", 1);
    } else if (tipo === 'colores') {
      const tieneColores = detallesCrear[index]?.colores?.length > 0;

      if (!tieneColores) {
        // Obtener el ID del producto del detalle actual
        const productoId = detallesCrear[index]?.ProductoId;
        console.log("ProductoId del detalle:", productoId);

        if (!productoId) {
          console.error("❌ No hay producto seleccionado para este detalle");
          toast.error("Debe seleccionar un producto primero");
          onActualizarDetalle(index, "tipoStock", "general");
          return;
        }

        // 🔥 VERIFICAR EL ARRAY DE PRODUCTOS
        console.log("🔍 Array de productos completo:", productos);
        console.log("🔍 Tipo de productos:", typeof productos);
        console.log("🔍 ¿es array?", Array.isArray(productos));

        // Buscar el producto en la lista de productos
        const producto = productos?.find(p => p.ProductoId === productoId);
        console.log("Producto encontrado:", producto);

        if (producto) {
          // Verificar si el producto usa colores
          const usaColores = producto.UsaColores === 1 || producto.UsaColores === true || producto.UsaColores === "1";

          if (!usaColores) {
            console.warn("⚠️ Este producto no usa colores");
            toast.warning("Este producto no tiene configuración de colores");
            onActualizarDetalle(index, "tipoStock", "general");
            return;
          }

          // Abrir el modal de colores
          abrirSelectorColor(index, producto);
        } else {
          console.error("❌ Producto no encontrado para index:", index);
          console.error("❌ ID buscado:", productoId);
          console.error("❌ IDs disponibles:", productos?.map(p => p.ProductoId));
          toast.error("Error: Producto no encontrado en la lista");
          onActualizarDetalle(index, "tipoStock", "general");
        }
      }
    }
  };

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

          {/* Fecha */}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">Fecha de registro *</label>
            <input
              type="date"
              value={formCrear.FechaRegistro || getTodayDate()}
              className="h-10 px-3 border rounded-lg bg-gray-100 text-sm w-full cursor-not-allowed"
              readOnly
              disabled
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
              className="text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
            >
              <Package size={14} />
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

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {detallesCrear.map((d, index) => {
              // 🔥 IMPORTANTE: Obtener el producto aquí para usarlo en toda la fila
              const producto = productos.find(p => p.ProductoId === d.ProductoId);
              const tieneProducto = !!d.ProductoId;
              const usaColores = producto?.UsaColores === 1 || producto?.UsaColores === true || producto?.UsaColores === "1";
              const tipoStock = d.tipoStock || (usaColores ? 'colores' : 'general');
              const tieneColores = d.colores && d.colores.length > 0;

              return (
                <div key={index} className="bg-gray-50 border rounded-lg p-4">
                  {/* Fila principal */}
                  <div className="grid grid-cols-12 gap-3 items-start">
                    {/* Producto */}
                    <div className="col-span-4">
                      <button
                        type="button"
                        onClick={() => onSelectProducto("create", index)}
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
                          onChange={(e) => handleTipoStockChange(index, e.target.value)}
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
                            value={d.Cantidad || 1}
                            onChange={(e) => onActualizarDetalle(index, "Cantidad", e.target.value)}
                            className="w-full h-10 px-2 border rounded-lg text-xs text-center"
                            min="1"
                            placeholder="0"
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
                            value={d.PrecioUnitario || 0}
                            onChange={(e) => onActualizarDetalle(index, "PrecioUnitario", e.target.value)}
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
                          onClick={() => onEliminarDetalle(index)}
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
                              console.log("Botón Seleccionar colores clickeado - Index:", index);
                              console.log("Producto en este índice:", producto);
                              if (producto) {
                                abrirSelectorColor(index, producto);
                              } else {
                                console.error("❌ Producto es undefined");
                                toast.error("Debe seleccionar un producto primero");
                                // Cambiar a general si no hay producto
                                onActualizarDetalle(index, "tipoStock", "general");
                              }
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border w-full ${tieneColores
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-dashed border-gray-300 bg-white hover:border-purple-400'
                              }`}
                          >
                            <Palette size={16} className={tieneColores ? 'text-purple-600' : 'text-gray-400'} />
                            <span className={`text-xs ${tieneColores ? 'text-purple-800 font-medium' : 'text-gray-500'}`}>
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
                        onChange={(e) => onActualizarDetalle(index, "Descripcion", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Descripción adicional (opcional)"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
            className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all font-medium text-sm shadow-lg shadow-emerald-500/30"
          >
            Crear Compra (Pendiente)
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