import React from "react";
import { Search, ListFilter, Check } from "lucide-react";
import Modal from "../../components/modals/modal.jsx";

export const CategoriaModal = ({
  open,
  onClose,
  categoriasFiltradas,
  categoriaBusqueda,
  setCategoriaBusqueda,
  seleccionarCategoria,
  selectedCategoriaId
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 bg-white rounded-xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="mb-6">
          <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-blue-600" />
            Seleccionar Categoría
          </h3>
          <p className="text-gray-600 text-sm mb-4">Busque y seleccione una categoría para el producto</p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar categoría por nombre o ID..."
              value={categoriaBusqueda}
              onChange={(e) => setCategoriaBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {categoriasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {categoriasFiltradas.map((categoria) => (
                <button
                  key={categoria.CategoriaId}
                  type="button"
                  onClick={() => seleccionarCategoria(categoria)}
                  className={`p-3 text-left rounded-lg border transition-all ${selectedCategoriaId === categoria.CategoriaId
                    ? "bg-blue-50 border-blue-500"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{categoria.Nombre}</div>
                      <div className="text-sm text-gray-500 mt-1">ID: {categoria.CategoriaId}</div>
                    </div>
                    {selectedCategoriaId === categoria.CategoriaId && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No se encontraron categorías</p>
              <p className="text-gray-500 text-sm mt-1">Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">
              {categoriasFiltradas.length} categoría(s) encontrada(s)
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};