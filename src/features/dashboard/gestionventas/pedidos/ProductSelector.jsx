import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { ModalPaginado } from "../../components/modals/ModalPaginado";
import { formatPrice } from "../pedidos/utils/pedidosHelpers";
import { GetDataproductos, buscarProductos } from "../../productos/services/services.products";

export const ProductSelector = ({
  isOpen,
  onClose,
  onSelect,
  productos: initialProductos = [], // Mantenemos como fallback
  searchTerm: externalSearchTerm,
  onSearchChange: externalOnSearchChange,
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  onPageChange: externalOnPageChange,
  totalItems: externalTotalItems,
  itemsPerPage = 5
}) => {
  // Estados internos para manejar la paginación
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || "");
  const [currentPage, setCurrentPage] = useState(externalCurrentPage || 1);
  const [totalPages, setTotalPages] = useState(externalTotalPages || 1);
  const [totalItems, setTotalItems] = useState(externalTotalItems || 0);

  // Cargar productos cuando se abre el modal o cambian los filtros
  useEffect(() => {
    if (isOpen) {
      cargarProductos();
    }
  }, [isOpen, currentPage, searchTerm]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      
      let resultado;
      if (searchTerm) {
        // Si hay término de búsqueda, usar búsqueda
        resultado = await buscarProductos('nombre', searchTerm, currentPage, itemsPerPage, 'Activo');
      } else {
        // Si no, obtener todos los activos con paginación
        resultado = await GetDataproductos(true, currentPage, itemsPerPage);
      }
      
      setProductos(resultado.data);
      setTotalPages(resultado.pagination.totalPages);
      setTotalItems(resultado.pagination.totalItems);
      
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Resetear a primera página al buscar
    if (externalOnSearchChange) {
      externalOnSearchChange(term);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (externalOnPageChange) {
      externalOnPageChange(page);
    }
  };

  return (
    <ModalPaginado
      isOpen={isOpen}
      onClose={onClose}
      titulo="Seleccionar Producto"
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      loading={loading}
    >
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Cargando productos...</p>
          </div>
        ) : (
          <>
            {productos.map((producto) => (
              <button
                key={producto.ProductoId}
                onClick={() => onSelect(producto)}
                className="w-full p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  {producto.Imagen ? (
                    <img 
                      src={producto.Imagen} 
                      alt={producto.Nombre} 
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        // Fallback cuando la imagen no carga
                        const parent = e.target.parentNode;
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'w-12 h-12 bg-blue-100 rounded flex items-center justify-center';
                        fallbackDiv.innerHTML = '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4v10l8 4 8-4V7z"></path></svg>';
                        parent.appendChild(fallbackDiv);
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                      <Package size={24} className="text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{producto.Nombre}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                        Producto
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {formatPrice(producto.Precio || 0)}
                      </span>
                    </div>
                    {producto.Stock !== undefined && (
                      <span className="text-xs text-slate-500 ml-2">
                        Stock: {producto.Stock}
                      </span>
                    )}
                    {producto.UsaColores === 1 && producto.colores_count > 0 && (
                      <span className="text-xs text-purple-600 ml-2">
                        🎨 {producto.colores_count} colores
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            
            {!loading && productos.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
              </div>
            )}
          </>
        )}
      </div>
    </ModalPaginado>
  );
};