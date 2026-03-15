import React, { useState, useEffect, useMemo } from "react";
import { ModalPaginado } from "../../components/modals/ModalPaginado";

export const ColorSelector = ({
  isOpen,
  onClose,
  onSelect,
  colores = [],
  searchTerm: externalSearchTerm,
  onSearchChange: externalOnSearchChange,
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  onPageChange: externalOnPageChange,
  totalItems: externalTotalItems,
  itemsPerPage = 8 // Aumentado a 8 para mejor visualización en grid
}) => {
  // Estados internos para manejar la paginación
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || "");
  const [currentPage, setCurrentPage] = useState(externalCurrentPage || 1);

  // Aplicar búsqueda con useMemo para mejor rendimiento
  const filteredColores = useMemo(() => {
    if (!searchTerm.trim()) return colores;

    const searchLower = searchTerm.toLowerCase();
    return colores.filter(c => 
      (c.Nombre || "").toLowerCase().includes(searchLower) ||
      (c.Hex || c.CodigoHex || "").toLowerCase().includes(searchLower)
    );
  }, [colores, searchTerm]);

  // Calcular paginación
  const totalItems = filteredColores.length;
  const totalPagesCalculated = Math.ceil(totalItems / itemsPerPage);

  // Obtener colores paginados
  const paginatedColores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredColores.slice(start, end);
  }, [filteredColores, currentPage, itemsPerPage]);

  // Resetear página cuando cambia la búsqueda
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
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

  // Resetear cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setCurrentPage(1);
    }
  }, [isOpen]);

  return (
    <ModalPaginado
      isOpen={isOpen}
      onClose={onClose}
      titulo="Seleccionar Color"
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      currentPage={currentPage}
      totalPages={totalPagesCalculated}
      onPageChange={handlePageChange}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {paginatedColores.map((color) => (
          <button
            key={color.ColorId || color.id}
            onClick={() => {
              onSelect(color);
              onClose(); // Cerrar modal después de seleccionar
            }}
            className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform"
                style={{ backgroundColor: color.Hex || color.CodigoHex || '#e5e7eb' }}
              ></div>
              <div>
                <div className="font-medium text-gray-800">{color.Nombre}</div>
                <div className="text-xs text-gray-500 font-mono">
                  {color.Hex || color.CodigoHex}
                </div>
              </div>
            </div>
          </button>
        ))}
        
        {paginatedColores.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">
            {searchTerm ? 'No se encontraron colores' : 'No hay colores disponibles'}
          </div>
        )}
      </div>
    </ModalPaginado>
  );
};