import React from "react";
import { Package } from "lucide-react";
import { ModalPaginado } from "../../components/modals/ModalPaginado";
import { formatPrice } from "../pedidos/utils/pedidosHelpers";

export const ServicioSelector = ({
  isOpen,
  onClose,
  onSelect,
  servicios = [],
  searchTerm,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 5
}) => {
  // Filtrar servicios activos
  const serviciosActivos = servicios.filter(s => s.Estado === 'Activo');
  
  // Aplicar búsqueda
  const filteredServicios = searchTerm
    ? serviciosActivos.filter(s => 
        (s.Nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : serviciosActivos;

  // Paginación
  const paginatedServicios = filteredServicios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPagesCalculated = Math.ceil(filteredServicios.length / itemsPerPage);

  return (
    <ModalPaginado
      isOpen={isOpen}
      onClose={onClose}
      titulo="Seleccionar Servicio"
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      currentPage={currentPage}
      totalPages={totalPagesCalculated}
      onPageChange={onPageChange}
      totalItems={filteredServicios.length}
      itemsPerPage={itemsPerPage}
    >
      <div className="space-y-2">
        {paginatedServicios.map((servicio) => (
          <button
            key={servicio.ServicioId}
            onClick={() => onSelect(servicio)}
            className="w-full p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              {servicio.Imagen ? (
                <img 
                  src={servicio.Imagen} 
                  alt={servicio.Nombre} 
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML += '<div class="w-12 h-12 bg-purple-100 rounded flex items-center justify-center"><svg class="w-6 h-6 text-purple-600" ...></div>';
                  }}
                />
              ) : (
                <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center">
                  <Package size={24} className="text-purple-600" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium">{servicio.Nombre}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                    Servicio
                  </span>
                  <span className="text-sm font-semibold text-purple-600">
                    {formatPrice(servicio.Precio || 0)}
                  </span>
                </div>
                {servicio.RequiereImagen === 1 && (
                  <span className="text-xs text-amber-600 ml-2">
                    ⚠️ Requiere imagen
                  </span>
                )}
                {servicio.Descripcion && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {servicio.Descripcion}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
        
        {paginatedServicios.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No hay servicios disponibles
          </div>
        )}
      </div>
    </ModalPaginado>
  );
};