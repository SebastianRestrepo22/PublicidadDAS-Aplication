import { useState, useCallback } from 'react';

export const useModalPaginado = (items = [], itemsPerPage = 8) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredItems, setFilteredItems] = useState([]);

  const filterItems = useCallback((search, itemsList = items) => {
    if (!search) return itemsList;
    return itemsList.filter(item => 
      (item.Nombre || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.CodigoHex || "").toLowerCase().includes(search.toLowerCase())
    );
  }, []);

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
    setFilteredItems(filterItems(term, items));
  }, [filterItems, items]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return {
    isOpen,
    openModal,
    closeModal,
    searchTerm,
    handleSearch,
    currentPage,
    totalPages,
    handlePageChange,
    paginatedItems,
    filteredItems,
    totalItems: filteredItems.length,
    itemsPerPage
  };
};