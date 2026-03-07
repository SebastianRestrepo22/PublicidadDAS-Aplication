import React from "react";
import { Package } from "lucide-react";
import { ModalPaginado } from "../../components/modals/ModalPaginado";
import { formatPrice } from "../pedidos/utils/pedidosHelpers";

export const ProductSelector = ({
  isOpen,
  onClose,
  onSelect,
  productos = [],
  searchTerm,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 5
}) => {
  // Filtrar productos activos
  const productosActivos = productos.filter(p => p.Estado === 'Activo');
  
  // Aplicar búsqueda
  const filteredProductos = searchTerm
    ? productosActivos.filter(p => 
        (p.Nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : productosActivos;

  // Paginación
  const paginatedProductos = filteredProductos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPagesCalculated = Math.ceil(filteredProductos.length / itemsPerPage);

  return (
    <ModalPaginado
      isOpen={isOpen}
      onClose={onClose}
      titulo="Seleccionar Producto"
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      currentPage={currentPage}
      totalPages={totalPagesCalculated}
      onPageChange={onPageChange}
      totalItems={filteredProductos.length}
      itemsPerPage={itemsPerPage}
    >
      <div className="space-y-2">
        {paginatedProductos.map((producto) => (
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
                    e.target.parentNode.innerHTML += '<div class="w-12 h-12 bg-blue-100 rounded flex items-center justify-center"><svg class="w-6 h-6 text-blue-600" ...></div>';
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
              </div>
            </div>
          </button>
        ))}
        
        {paginatedProductos.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No hay productos disponibles
          </div>
        )}
      </div>
    </ModalPaginado>
  );
};