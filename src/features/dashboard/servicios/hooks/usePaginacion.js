import { useState, useEffect, useCallback } from "react";
import { GetDataservicios, buscarservicios } from "../services/services.servicios.js";

export const usePaginacion = (mode) => {
    const [paginatedData, setPaginatedData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filtroCampo, setFiltroCampo] = useState('');
    const [filtroValor, setFiltroValor] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 🔥 Función para cargar datos (ahora puede ser llamada desde fuera)
    const cargarServicios = useCallback(async () => {
        if (mode !== "list") return;

        setIsLoading(true);
        try {
            let resultado;

            if (filtroCampo && filtroValor) {
                resultado = await buscarservicios(
                    filtroCampo, 
                    filtroValor, 
                    currentPage, 
                    itemsPerPage, 
                    filtroEstado || null
                );
            } else {
                resultado = await GetDataservicios(
                    filtroEstado === 'Activo', 
                    currentPage, 
                    itemsPerPage
                );
            }

            setPaginatedData(resultado.data);
            setTotalItems(resultado.pagination.totalItems);
            setTotalPages(resultado.pagination.totalPages);

        } catch (error) {
            console.error("Error cargando servicios:", error);
            setPaginatedData([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage, filtroCampo, filtroValor, filtroEstado, mode]);

    // Cargar datos cuando cambian los parámetros
    useEffect(() => {
        cargarServicios();
    }, [cargarServicios]);

    // Resetear página cuando cambian filtros
    useEffect(() => {
        if (filtroCampo && filtroValor) setCurrentPage(1);
    }, [filtroCampo, filtroValor]);

    useEffect(() => {
        if (filtroEstado) setCurrentPage(1);
    }, [filtroEstado]);

    const handlePageChange = (page) => setCurrentPage(page);
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    return {
        paginatedData,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        filtroCampo, setFiltroCampo,
        filtroValor, setFiltroValor,
        filtroEstado, setFiltroEstado,
        isLoading,
        handlePageChange,
        handleItemsPerPageChange,
        refrescar: cargarServicios 
    };
};