import { useState, useEffect } from "react";
import { GetDataservicios, buscarservicios } from "../services/services.servicios.js";

export const usePaginacion = (mode, externalData = null, setExternalData = null) => {
    const [allData, setAllData] = useState([]);
    const [paginatedData, setPaginatedData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filtroCampo, setFiltroCampo] = useState('');
    const [filtroValor, setFiltroValor] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Usar datos externos si se proporcionan
    const dataToUse = externalData !== null ? externalData : allData;
    const setDataToUse = setExternalData || setAllData;

    // Efecto para cargar datos con paginación backend
    useEffect(() => {
        const cargarServicios = async () => {
            if (mode !== "list") return;

            setIsLoading(true);
            try {
                let resultado;

                // Determinar si usar búsqueda o listado normal
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

                // Extraer datos y paginación
                const data = resultado?.data && Array.isArray(resultado.data) ? resultado.data : [];
                const pagination = resultado?.pagination || {};

                console.log('Datos cargados:', data);
                console.log('Paginación:', pagination);

                // Actualizar estados
                setDataToUse(data);
                setPaginatedData(data);
                setTotalItems(pagination.totalItems || 0);
                setTotalPages(pagination.totalPages || 1);

                // Ajustar página si es necesario
                if (currentPage > (pagination.totalPages || 1) && (pagination.totalPages || 0) > 0) {
                    setCurrentPage(pagination.totalPages);
                }

            } catch (error) {
                console.error("Error cargando servicios:", error);
                setDataToUse([]);
                setPaginatedData([]);
                setTotalItems(0);
                setTotalPages(1);
            } finally {
                setIsLoading(false);
            }
        };

        cargarServicios();
    }, [currentPage, itemsPerPage, filtroCampo, filtroValor, filtroEstado, mode]);

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        if (filtroCampo && filtroValor) {
            setCurrentPage(1);
        }
    }, [filtroCampo, filtroValor]);

    useEffect(() => {
        if (filtroEstado) {
            setCurrentPage(1);
        }
    }, [filtroEstado]);

    const handlePageChange = (page) => setCurrentPage(page);
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    return {
        allData: dataToUse,
        setAllData: setDataToUse,
        paginatedData,
        setPaginatedData,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        filtroCampo,
        setFiltroCampo,
        filtroValor,
        setFiltroValor,
        filtroEstado,
        setFiltroEstado,
        isLoading,
        handlePageChange,
        handleItemsPerPageChange
    };
};