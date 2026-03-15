import { useState, useCallback, useEffect } from 'react';

export const useModalPaginado = (items = [], itemsPerPage = 8, searchFields = ['Nombre', 'CodigoHex']) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredItems, setFilteredItems] = useState([]);

  // Función de filtrado mejorada que acepta múltiples campos
  const filterItems = useCallback((search, itemsList = items) => {
    if (!search.trim()) return itemsList;
    
    const searchLower = search.toLowerCase().trim();
    
    return itemsList.filter(item => {
      // Buscar en los campos especificados
      return searchFields.some(field => {
        const value = item[field];
        if (!value) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [searchFields]);

  // Actualizar items filtrados cuando cambian los items o el searchTerm
  useEffect(() => {
    if (isOpen) {
      setFilteredItems(filterItems(searchTerm, items));
    }
  }, [items, searchTerm, filterItems, isOpen]);

  const openModal = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(1);
    setFilteredItems(filterItems("", items));
    setIsOpen(true);
  }, [items, filterItems]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    // El useEffect se encargará de actualizar filteredItems
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(1);
    setFilteredItems(filterItems("", items));
  }, [items, filterItems]);

  // Calcular items paginados
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return {
    // Estados
    isOpen,
    searchTerm,
    currentPage,
    filteredItems,
    paginatedItems,
    totalItems: filteredItems.length,
    itemsPerPage,
    totalPages,
    
    // Acciones
    openModal,
    closeModal,
    handleSearch,
    handlePageChange,
    resetFilters,
    
    // Utilidades
    hasItems: filteredItems.length > 0,
    isEmpty: filteredItems.length === 0,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages || totalPages === 0
  };
};