import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, AlertCircle } from "lucide-react";

export const ColorSelector = ({ goToBack, onSelect, colores }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredColors, setFilteredColors] = useState([]);

  useEffect(() => {
    if (!colores) {
      setFilteredColors([]);
      return;
    }
    const filtered = colores.filter(color =>
      (color.Nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (color.CodigoHex || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredColors(filtered);
  }, [searchTerm, colores]);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={goToBack} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3 className="text-lg font-bold">Seleccionar Color</h3>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredColors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredColors.map((color) => (
            <button
              key={color.ColorId || color.id}
              onClick={() => onSelect(color)}
              className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-left"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg border border-slate-300"
                  style={{ backgroundColor: color.CodigoHex || '#e5e7eb' }}
                ></div>
                <div>
                  <div className="font-medium">{color.Nombre || "Sin nombre"}</div>
                  <div className="text-sm text-slate-600">{color.CodigoHex || "Sin código"}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
          <h4 className="text-lg font-medium text-slate-700">No se encontraron colores</h4>
        </div>
      )}
    </div>
  );
};