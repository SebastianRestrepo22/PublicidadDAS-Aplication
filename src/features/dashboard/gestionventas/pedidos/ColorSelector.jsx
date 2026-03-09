import React from "react";
import { ModalPaginado } from "../../components/modals/ModalPaginado";

export const ColorSelector = ({
  isOpen,
  onClose,
  onSelect,
  colores = [],
  searchTerm,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 5
}) => {
  // Aplicar búsqueda
  const filteredColores = searchTerm
    ? colores.filter(c => 
        (c.Nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.Hex || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : colores;

  // Paginación
  const paginatedColores = filteredColores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPagesCalculated = Math.ceil(filteredColores.length / itemsPerPage);

  return (
    <ModalPaginado
      isOpen={isOpen}
      onClose={onClose}
      titulo="Seleccionar Color"
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      currentPage={currentPage}
      totalPages={totalPagesCalculated}
      onPageChange={onPageChange}
      totalItems={filteredColores.length}
      itemsPerPage={itemsPerPage}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {paginatedColores.map((color) => (
          <button
            key={color.ColorId || color.id}
            onClick={() => onSelect(color)}
            className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border-2"
                style={{ backgroundColor: color.Hex || '#e5e7eb' }}
              ></div>
              <div>
                <div className="font-medium">{color.Nombre}</div>
                <div className="text-xs text-slate-500">{color.Hex}</div>
              </div>
            </div>
          </button>
        ))}
        
        {paginatedColores.length === 0 && (
          <div className="col-span-2 text-center py-8 text-slate-500">
            No hay colores disponibles
          </div>
        )}
      </div>
    </ModalPaginado>
  );
};