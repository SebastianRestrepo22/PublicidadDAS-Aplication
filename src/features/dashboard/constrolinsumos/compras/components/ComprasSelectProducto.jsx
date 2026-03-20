import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";

const formatPrice = (value) => {
  const num = Number(value);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
};

const getShortId = (id) => {
  const str = String(id || "");
  return str.length > 3 ? str.substring(0, 3) : str;
};

export const ComprasSelectProducto = ({
  searchTermProductos,
  setSearchTermProductos,
  productosPaginados,
  totalProductos,
  currentPageProductos,
  totalPagesProductos,
  loadingProductos,
  onLoadProductos,
  onSelectProducto,
  onCancel
}) => {
  // Estados para paginación en frontend
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // 3 items por página

  // Filtrar productos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTermProductos.trim() === "") {
      setFilteredProducts(productosPaginados);
    } else {
      const filtered = productosPaginados.filter(producto => 
        producto.Nombre.toLowerCase().includes(searchTermProductos.toLowerCase()) ||
        (producto.SKU && producto.SKU.toLowerCase().includes(searchTermProductos.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
    setCurrentPage(1); // Resetear a primera página al filtrar
  }, [searchTermProductos, productosPaginados]);

  // Calcular productos a mostrar en la página actual
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  // Calcular total de páginas en frontend
  const totalFrontendPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const currentProducts = getCurrentPageProducts();

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onCancel}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3 className="text-lg font-bold">Seleccionar Producto</h3>
          <p className="text-sm text-gray-600">
            Busca y selecciona el producto que deseas agregar a la compra
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTermProductos}
            onChange={(e) => {
              const term = e.target.value;
              setSearchTermProductos(term);
              // También llamar al backend para búsqueda más amplia
              onLoadProductos(1, term);
            }}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">
            Mostrando {currentProducts.length} de {filteredProducts.length} productos
          </span>
          <span className="text-gray-600">
            Página {currentPage} de {totalFrontendPages || 1}
          </span>
        </div>
        
        {/* Contenedor sin scroll - altura fija para 3 items */}
        <div className="bg-gray-50 rounded-lg border" style={{ height: 'auto', minHeight: '200px' }}>
          {loadingProductos ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Cargando productos...</p>
            </div>
          ) : currentProducts.length > 0 ? (
            <div className="divide-y">
              {currentProducts.map((item) => (
                <div
                  key={item.ProductoId}
                  onClick={() => onSelectProducto(item)}
                  className="p-4 hover:bg-emerald-50 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.Nombre}
                    </div>
                    <div className="text-gray-600 text-sm">SKU: {item.SKU || "N/A"}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-emerald-700">{formatPrice(item.Precio)}</div>
                    <div className="text-gray-600 text-xs">Precio unitario</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="text-lg mb-2">No hay resultados</div>
              <div className="text-sm">Intenta con otros términos de búsqueda</div>
            </div>
          )}
        </div>
      </div>

      {/* Paginación en frontend - solo visible cuando hay más de 3 productos */}
      {totalFrontendPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalFrontendPages) }, (_, i) => {
              let pageNum;
              if (totalFrontendPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalFrontendPages - 2) {
                pageNum = totalFrontendPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-full ${
                    currentPage === pageNum
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalFrontendPages}
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