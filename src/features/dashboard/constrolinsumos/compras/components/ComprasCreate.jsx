import React from "react";
import { ArrowLeft, ChevronRight, Package } from "lucide-react";

const formatPrice = (value) => {
  const num = Number(value);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
};

export const ComprasCreate = ({
  formCrear,
  setFormCrear,
  detallesCrear,
  productos,
  proveedores,
  errores,
  onBack,
  onSelectProveedor,
  onSelectProducto,
  onActualizarDetalle,
  onAñadirDetalle,
  onEliminarDetalle,
  onCreate,
  getProveedorDisplay,
  getProductoDisplay,
  calcularTotal
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-lg font-bold">Nueva compra</h3>
      </div>

      {errores.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <ul className="list-disc pl-5">
            {errores.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="flex flex-col gap-2">
          <label className="font-medium">Proveedor *</label>
          <button
            type="button"
            onClick={() => onSelectProveedor("create")}
            className="h-11 px-4 border rounded bg-white hover:bg-gray-50 text-left flex items-center justify-between"
          >
            <span>{getProveedorDisplay(formCrear.ProveedorId, formCrear.nombreProveedor)}</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium">Fecha de registro *</label>
          <input
            type="date"
            value={formCrear.FechaRegistro}
            onChange={(e) => setFormCrear({ ...formCrear, FechaRegistro: e.target.value })}
            className="w-full h-11 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium">Total (Calculado)</label>
          <input
            type="text"
            readOnly
            value={formatPrice(calcularTotal())}
            className="w-full h-11 px-3 border rounded bg-gray-100 font-medium"
          />
        </div>
      </div>

      {/* Artículos de la Compra */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold text-gray-800">Artículos de la Compra</h4>
          <button
            type="button"
            onClick={onAñadirDetalle}
            className="text-sm bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
          >
            + Agregar artículo
          </button>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Producto</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                    Descripción <span className="text-gray-400 font-normal">(Opcional)</span>
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600">Cantidad</th>
                  <th className="py-4 px-6 text-right text-sm font-semibold text-gray-600">Precio Unit.</th>
                  <th className="py-4 px-6 text-right text-sm font-semibold text-gray-600">Subtotal</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {detallesCrear.map((d, index) => {
                  const producto = productos.find(p => p.ProductoId === d.ProductoId);
                  const tieneProducto = !!d.ProductoId;
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => onSelectProducto("create", index)}
                          className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-300 ${
                            tieneProducto
                              ? 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100'
                              : 'border-dashed border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                            tieneProducto
                              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30'
                              : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}>
                            <Package size={20} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold truncate ${
                              tieneProducto ? 'text-emerald-800' : 'text-gray-500'
                            }`}>
                              {producto?.Nombre || "Seleccionar producto"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {producto?.SKU ? `SKU: ${producto.SKU}` : "Click para buscar"}
                            </p>
                          </div>
                          <ChevronRight size={18} className={`flex-shrink-0 ${
                            tieneProducto ? 'text-emerald-600' : 'text-gray-400'
                          }`} />
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="text"
                          value={d.Descripcion}
                          onChange={(e) => onActualizarDetalle(index, "Descripcion", e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Descripción (opcional)"
                        />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <input
                          type="number"
                          value={d.Cantidad}
                          onChange={(e) => onActualizarDetalle(index, "Cantidad", e.target.value)}
                          className="w-20 px-3 py-2 border rounded text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                          min="1"
                        />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <input
                          type="number"
                          value={d.PrecioUnitario}
                          onChange={(e) => onActualizarDetalle(index, "PrecioUnitario", e.target.value)}
                          className="w-28 px-3 py-2 border rounded text-right focus:outline-none focus:ring-2 focus:ring-green-500"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-gray-800">
                        {formatPrice(d.Subtotal)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {detallesCrear.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onEliminarDetalle(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                            title="Eliminar artículo"
                          >
                            🗑️
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg mb-6 border border-emerald-200">
        <div className="flex justify-between items-center text-lg font-bold">
          <span className="text-emerald-800">Total:</span>
          <span className="text-emerald-700 text-xl">
            {formatPrice(calcularTotal())}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <button
          type="button"
          onClick={onCreate}
          className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all font-medium shadow-lg shadow-emerald-500/30"
        >
          Crear Compra
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-11 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};