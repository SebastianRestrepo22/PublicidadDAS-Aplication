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

    // Usar datos externos si se proporcionan
    const dataToUse = externalData !== null ? externalData : allData;
    const setDataToUse = setExternalData || setAllData;

    const paginateData = (data) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    // Efecto para cargar datos iniciales
    useEffect(() => {
        const cargarservicio = async () => {
            if (mode !== "list") return;

            try {
                let resultados;
                if (filtroCampo && filtroValor) {
                    const res = await buscarservicios(filtroCampo, filtroValor);
                    resultados = Array.isArray(res) ? res : [];
                } else {
                    const todos = await GetDataservicios();
                    resultados = Array.isArray(todos?.data) ? todos.data : [];
                }

                // Aplicar filtro de estado
                if (filtroEstado) {
                    resultados = resultados.filter(s => s.Estado === filtroEstado);
                }

                setDataToUse(resultados);

                // Manejar caso sin resultados
                if (resultados.length === 0) {
                    setPaginatedData([]);
                    setTotalItems(0);
                    setTotalPages(1);
                    setCurrentPage(1); // Resetear a página 1
                } else {
                    setTotalItems(resultados.length);
                    const totalPages = Math.ceil(resultados.length / itemsPerPage);
                    setTotalPages(totalPages);

                    if (currentPage > totalPages) {
                        setCurrentPage(totalPages);
                    } else {
                        setPaginatedData(paginateData(resultados));
                    }
                }
            } catch (error) {
                console.error(error);
                // En caso de error, limpiar todo
                setPaginatedData([]);
                setDataToUse([]);
                setTotalItems(0);
                setTotalPages(1);
                setCurrentPage(1);
            }
        };

        cargarservicio();
    }, [filtroCampo, filtroValor, filtroEstado, mode]); // Removemos dependencias innecesarias


    // Efecto para actualizar paginación cuando cambian los datos o la página
    useEffect(() => {
        if (mode === "list") {
            // Aplicar filtro de estado si existe
            let datosFiltrados = dataToUse;

            if (filtroEstado) {
                datosFiltrados = dataToUse.filter(s => s.Estado === filtroEstado);
            }

            // Calcular total de páginas incluso cuando no hay datos
            const totalItemsCount = datosFiltrados.length;
            setTotalItems(totalItemsCount);

            const nuevasPaginas = totalItemsCount > 0
                ? Math.ceil(totalItemsCount / itemsPerPage)
                : 1;

            setTotalPages(nuevasPaginas);

            // Ajustar página actual si es necesario
            if (totalItemsCount === 0) {
                // Si no hay datos, resetear a página 1
                setCurrentPage(1);
                setPaginatedData([]);
            } else {
                // Ajustar si la página actual es mayor que el total de páginas
                if (currentPage > nuevasPaginas) {
                    setCurrentPage(nuevasPaginas);
                } else {
                    // Calcular datos paginados normalmente
                    const paginated = paginateData(datosFiltrados);
                    setPaginatedData(paginated);
                }
            }
        }
    }, [dataToUse, itemsPerPage, currentPage, mode, filtroEstado]);

    // fecto para manejar cambios de página
    useEffect(() => {
        if (mode === "list" && dataToUse.length > 0) {
            // Aplicar filtros
            let datosFiltrados = dataToUse;
            if (filtroEstado) {
                datosFiltrados = dataToUse.filter(s => s.Estado === filtroEstado);
            }

            if (datosFiltrados.length > 0) {
                const paginated = paginateData(datosFiltrados);
                setPaginatedData(paginated);
            }
        }
    }, [currentPage, dataToUse, filtroEstado, itemsPerPage, mode]);

    // Efecto para resetear página cuando cambian los filtros
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
        handlePageChange,
        handleItemsPerPageChange
    };
};