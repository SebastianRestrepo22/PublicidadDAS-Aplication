import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange }) => {
  const pagesToShow = 5; // Número máximo de páginas a mostrar
  
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    
    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 bg-white sm:px-6 rounded-b-lg">
      {/* Información de elementos */}
      <div className="flex items-center mb-3 sm:mb-0">
        <span className="text-sm text-gray-700 mr-4">
          Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span> de <span className="font-medium">{totalItems}</span> resultados
        </span>
        
        {/* Selector de elementos por página */}
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-2">Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Navegación de páginas */}
      <div className="flex items-center">
        {/* Botón primera página */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <span className="sr-only">Primera página</span>
          <ChevronsLeft size={16} />
        </button>
        
        {/* Botón página anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <span className="sr-only">Anterior</span>
          <ChevronLeft size={16} />
        </button>
        
        {/* Números de página */}
        <div className="hidden md:flex">
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === page
                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        {/* Versión móvil - solo página actual */}
        <div className="flex md:hidden mx-2">
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
        </div>
        
        {/* Botón página siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <span className="sr-only">Siguiente</span>
          <ChevronRight size={16} />
        </button>
        
        {/* Botón última página */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <span className="sr-only">Última página</span>
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};