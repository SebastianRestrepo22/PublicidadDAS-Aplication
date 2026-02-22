import React from "react";
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";

const getShortId = (id) => {
  const str = String(id || "");
  return str.length > 3 ? str.substring(0, 3) : str;
};

export const ComprasSelectProveedor = ({
  searchTermProveedores,
  setSearchTermProveedores,
  proveedoresPaginados,
  totalProveedores,
  currentPageProveedores,
  totalPagesProveedores,
  loadingProveedores,
  onLoadProveedores,
  onSelectProveedor,
  onCancel
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onCancel}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-lg font-bold">Seleccionar Proveedor</h3>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por ID o nombre del proveedor..."
            value={searchTermProveedores}
            onChange={(e) => {
              const term = e.target.value;
              setSearchTermProveedores(term);
              onLoadProveedores(1, term);
            }}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">
            Mostrando {proveedoresPaginados.length} de {totalProveedores} proveedores
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg border max-h-[400px] overflow-y-auto">
          {loadingProveedores ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Cargando proveedores...</p>
            </div>
          ) : proveedoresPaginados.length > 0 ? (
            <div className="divide-y">
              {proveedoresPaginados.map((prov) => (
                <div
                  key={prov.ProveedorId}
                  onClick={() => onSelectProveedor(prov)}
                  className="p-4 hover:bg-emerald-50 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{getShortId(prov.ProveedorId)}</div>
                    <div className="text-gray-600">{prov.NombreProveedor || "-"}</div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="text-lg mb-2">No hay proveedores disponibles</div>
              <div className="text-sm">Intenta con otros términos de búsqueda</div>
            </div>
          )}
        </div>
      </div>

      {totalPagesProveedores > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => onLoadProveedores(currentPageProveedores - 1, searchTermProveedores)}
            disabled={currentPageProveedores <= 1}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPagesProveedores) }, (_, i) => {
              let pageNum;
              if (totalPagesProveedores <= 5) {
                pageNum = i + 1;
              } else if (currentPageProveedores <= 3) {
                pageNum = i + 1;
              } else if (currentPageProveedores >= totalPagesProveedores - 2) {
                pageNum = totalPagesProveedores - 4 + i;
              } else {
                pageNum = currentPageProveedores - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onLoadProveedores(pageNum, searchTermProveedores)}
                  className={`w-8 h-8 rounded-full ${
                    currentPageProveedores === pageNum
                      ? 'bg-green-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => onLoadProveedores(currentPageProveedores + 1, searchTermProveedores)}
            disabled={currentPageProveedores >= totalPagesProveedores}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="w-full h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};