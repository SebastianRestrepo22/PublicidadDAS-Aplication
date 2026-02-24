import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Package, AlertCircle } from "lucide-react";
import { formatPrice, shortenId } from "../../gestionventas/pedidos/utils/pedidosHelpers";

export const ProductSelector = ({ goToBack, onSelect, productos, servicios }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    let items = [];
    if (filterType === "todos" || filterType === "producto") {
      items = [...items, ...(productos || []).map(p => ({ ...p, tipo: 'producto' }))];
    }
    if (filterType === "todos" || filterType === "servicio") {
      items = [...items, ...(servicios || []).map(s => ({ ...s, tipo: 'servicio', ProductoId: s.ServicioId }))];
    }

    if (searchTerm) {
      items = items.filter(item =>
        (item.Nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredItems(items);
  }, [searchTerm, filterType, productos, servicios]);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={goToBack} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3 className="text-lg font-bold">Seleccionar Producto/Servicio</h3>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-4">
          {["todos", "producto", "servicio"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === type ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <button
              key={item.ProductoId || item.ServicioId}
              onClick={() => onSelect(item)}
              className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-left"
            >
              <div className="flex items-start gap-4">
                {item.UrlImagen ? (
                  <img src={item.UrlImagen} alt={item.Nombre} className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Package size={24} className="text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium">{item.Nombre || "Sin nombre"}</div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.tipo === 'producto' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.tipo === 'producto' ? 'Producto' : 'Servicio'}
                  </span>
                  <div className="mt-2 text-lg font-bold text-blue-700">{formatPrice(item.Precio || 0)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
          <h4 className="text-lg font-medium text-slate-700">No se encontraron productos</h4>
        </div>
      )}
    </div>
  );
};