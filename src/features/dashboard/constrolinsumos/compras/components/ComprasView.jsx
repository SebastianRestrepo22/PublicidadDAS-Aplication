import React from "react";
import { ArrowLeft, Package } from "lucide-react";

const getShortId = (id) => {
  const str = String(id || "");
  return str.length > 3 ? str.substring(0, 3) : str;
};

const formatearFecha = (f) => {
  if (!f) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(f)) {
    const [year, month, day] = f.split('-');
    return `${day}/${month}/${year}`;
  }
  const d = new Date(f);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatPrice = (value) => {
  const num = Number(value);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
};

export const ComprasView = ({
  selectedCompra,
  productos,
  proveedores,
  onBack,
  getProveedorDisplay
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Compra #{getShortId(selectedCompra.CompraId)}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Detalles completos de la compra</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Proveedor</p>
              <p className="text-lg font-semibold text-gray-800 mt-1">
                {getProveedorDisplay(selectedCompra.ProveedorId, selectedCompra.nombreProveedor)}
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Fecha de Registro</p>
              <p className="text-lg font-semibold text-gray-800 mt-1">
                {formatearFecha(selectedCompra.FechaRegistro)}
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Estado</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  Number(selectedCompra.Estado) === 1
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {Number(selectedCompra.Estado) === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatPrice(selectedCompra.Total)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Artículos de la Compra */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold text-gray-800">Artículos de la Compra</h4>
          <span className="text-sm text-gray-500">
            {selectedCompra.detalle?.length || 0} artículo(s)
          </span>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(selectedCompra.detalle || []).map((d, index) => {
                  const producto = productos.find(p => p.ProductoId === d.ProductoId);
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package size={18} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {producto?.Nombre || `ID: ${getShortId(d.ProductoId)}`}
                            </p>
                            <p className="text-xs text-gray-500">SKU: {producto?.SKU || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-700 max-w-md break-words">
                          {d.Descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                          {d.Cantidad || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-gray-800">
                        {formatPrice(d.PrecioUnitario)}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-gray-800">
                        {formatPrice(d.Subtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onBack}
          className="w-full md:w-auto h-12 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium px-8 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          Volver a la lista
        </button>
      </div>
    </div>
  );
};