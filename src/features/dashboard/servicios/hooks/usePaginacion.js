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

                if (filtroEstado) {
                    resultados = resultados.filter(s => s.Estado === filtroEstado);
                }

                setDataToUse(resultados);
                setTotalItems(resultados.length);

                const totalPages = Math.ceil(resultados.length / itemsPerPage);
                setTotalPages(totalPages > 0 ? totalPages : 1);

                if (currentPage > totalPages && totalPages > 0) {
                    setCurrentPage(totalPages);
                }

                setPaginatedData(paginateData(resultados));
            } catch (error) {
                console.error(error);
                setPaginatedData([]);
                setDataToUse([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        };
        cargarservicio();
    }, [filtroCampo, filtroValor, filtroEstado, mode]);

    // Efecto para actualizar paginación cuando cambian los datos o la página
    useEffect(() => {
        if (dataToUse.length > 0 && mode === "list") {
            // Aplicar filtro de estado si existe
            let datosFiltrados = dataToUse;
            if (filtroEstado) {
                datosFiltrados = dataToUse.filter(s => s.Estado === filtroEstado);
            }

            const totalPages = Math.ceil(datosFiltrados.length / itemsPerPage);
            setTotalPages(totalPages > 0 ? totalPages : 1);
            setTotalItems(datosFiltrados.length);

            if (currentPage > totalPages && totalPages > 0) {
                setCurrentPage(totalPages);
            }

            setPaginatedData(paginateData(datosFiltrados));
        }
    }, [dataToUse, itemsPerPage, currentPage, mode, filtroEstado]);

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