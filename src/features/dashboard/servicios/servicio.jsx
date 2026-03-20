import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft } from "lucide-react";

import { useServicios } from "./hooks/useServicios";
import { useCategorias } from "../categoria/hook/useCategorias"; // Hook sin parámetros
import { usePaginacion } from "./hooks/usePaginacion";

import { BarraAcciones } from "./components/BarraAcciones";
import { TablaServicios } from "./components/TablaServicios";
import { FormularioServicio } from "./components/FormularioServicio";
import { DetalleServicio } from "./components/DetalleServicio";
import { ModalCategorias } from "./components/ModalCategorias";
import { ModalEliminar } from "./components/ModalEliminar";
import { ConfirmServicioModal } from "./modals/ConfirmServicioModal";

export const ServiciosDashboard = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const mode = useMemo(() => {
        if (location.pathname === "/dashboard/servicio/nuevo") return "create";
        if (id && location.pathname === `/dashboard/servicio/${id}/editar`) return "edit";
        if (id && location.pathname === `/dashboard/servicio/${id}`) return "view";
        return "list";
    }, [location.pathname, id]);

    const paginacion = usePaginacion(mode);
    const servicios = useServicios(mode, id, paginacion.refrescar);

    // ✅ Usar el hook correctamente (sin parámetros)
    const {
        allData,           // ← Datos de categorías (paginados)
        cargarCategorias   // ← Función para recargar
    } = useCategorias();

    // ✅ Estado local para manejar las categorías del modal
    const [categoriasLocales, setCategoriasLocales] = useState([]);
    const [categoriaBusquedaLocal, setCategoriaBusquedaLocal] = useState("");
    const [openCategoriasModalLocal, setOpenCategoriasModalLocal] = useState(false);

    // ✅ Cargar categorías con getAllCategorias cuando se abre el modal
    useEffect(() => {
        const cargarCategoriasModal = async () => {
            try {
                const { getAllCategorias } = await import("../categoria/services/services.categoria");
                const data = await getAllCategorias();
                console.log("📦 Categorías cargadas manualmente:", data);
                setCategoriasLocales(data);
            } catch (error) {
                console.error("Error cargando categorías:", error);
                setCategoriasLocales([]);
            }
        };

        if (openCategoriasModalLocal) {
            cargarCategoriasModal();
        }
    }, [openCategoriasModalLocal]);

    // ✅ Filtrar categorías localmente
    const categoriasFiltradasLocales = useMemo(() => {
        if (!Array.isArray(categoriasLocales)) return [];
        if (!categoriaBusquedaLocal) return categoriasLocales;
        return categoriasLocales.filter(cat =>
            cat.Nombre?.toLowerCase().includes(categoriaBusquedaLocal.toLowerCase())
        );
    }, [categoriasLocales, categoriaBusquedaLocal]);

    const handleViewClick = (servicio) => {
        servicios.goToView(servicio.ServicioId);
    };

    const handleEditClick = (servicio) => {
        if (servicio.Estado === 'Activo') {
            servicios.goToEdit(servicio.ServicioId);
        }
    };

    const handleSelectCategoria = (categoria) => {
        // Actualizar el formulario con la categoría seleccionada
        servicios.setValues({ ...servicios.values, CategoriaId: categoria.CategoriaId });
        setOpenCategoriasModalLocal(false);
        setCategoriaBusquedaLocal("");
    };

    // ✅ Función local para obtener nombre de categoría
    const obtenerNombreCategoriaLocal = (id) => {
        if (!id) return "Seleccionar categoría";
        // Buscar primero en categoriasLocales, luego en allData como fallback
        const cat = categoriasLocales.find(c => c.CategoriaId === id) ||
            allData?.find(c => c.CategoriaId === id);
        return cat ? cat.Nombre : "Categoría no encontrada";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">
                    Gestión de Servicios
                </h1>

                {mode === "list" && (
                    <>
                        <BarraAcciones
                            onNewClick={servicios.goToCreate}
                            filtroEstado={paginacion.filtroEstado}
                            setFiltroEstado={paginacion.setFiltroEstado}
                            filtroValor={paginacion.filtroValor}
                            setFiltroValor={paginacion.setFiltroValor}
                            filtroCampo={paginacion.filtroCampo}
                            setFiltroCampo={paginacion.setFiltroCampo}
                        />

                        <ModalEliminar
                            open={servicios.openEliminar}
                            onClose={() => {
                                servicios.setOpenEliminar(false);
                                servicios.setEditData(null);
                            }}
                            editData={servicios.editData}
                            onConfirm={servicios.handleDelete}
                        />

                        <ConfirmServicioModal
                            open={servicios.confirmEstadoModal.open}
                            onClose={() => servicios.setConfirmEstadoModal({
                                open: false,
                                servicioId: null,
                                nuevoEstado: null,
                                nombreServicio: ''
                            })}
                            onConfirm={servicios.handleConfirmToggleEstado}
                            title={`${servicios.confirmEstadoModal.nuevoEstado === 'Activo' ? 'Activar' : 'Desactivar'} Servicio`}
                            message={`¿Estás seguro de que deseas ${servicios.confirmEstadoModal.nuevoEstado === 'Activo' ? 'activar' : 'desactivar'} este servicio?`}
                            servicioNombre={servicios.confirmEstadoModal.nombreServicio}
                            type={servicios.confirmEstadoModal.nuevoEstado === 'Activo' ? 'info' : 'warning'}
                            confirmText={servicios.confirmEstadoModal.nuevoEstado === 'Activo' ? 'Sí, activar' : 'Sí, desactivar'}
                            cancelText="Cancelar"
                        />

                        <TablaServicios
                            paginatedData={paginacion.paginatedData}
                            categorias={allData || []} // Usar allData del hook como fallback
                            onView={handleViewClick}
                            onEdit={handleEditClick}
                            onDelete={servicios.handleDeleteClick}
                            onToggleEstado={servicios.handleToggleEstado}
                            currentPage={paginacion.currentPage}
                            totalPages={paginacion.totalPages}
                            totalItems={paginacion.totalItems}
                            itemsPerPage={paginacion.itemsPerPage}
                            onPageChange={paginacion.handlePageChange}
                            onItemsPerPageChange={paginacion.handleItemsPerPageChange}
                        />
                    </>
                )}

                {(mode === "create" || mode === "edit" || mode === "view") && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={servicios.goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                                <ArrowLeft size={18} />
                            </button>
                            <h2 className="text-xl font-bold">
                                {mode === "create" && "Nuevo Servicio"}
                                {mode === "edit" && "Editar Servicio"}
                                {mode === "view" && "Detalle del Servicio"}
                            </h2>
                        </div>

                        {mode === "view" ? (
                            <DetalleServicio
                                editData={servicios.editData}
                                categorias={allData || []}
                                onEdit={servicios.goToEdit}
                                onDelete={servicios.handleDeleteClick}
                                onBack={servicios.goToBackToList}
                            />
                        ) : (
                            <FormularioServicio
                                mode={mode}
                                values={servicios.values}
                                setValues={servicios.setValues}
                                estadoEdit={servicios.estadoEdit}
                                setEstadoEdit={servicios.setEstadoEdit}
                                submitted={servicios.submitted}
                                nombreError={servicios.nombreError}
                                isSubmitting={servicios.isSubmitting}
                                handleChanges={servicios.handleChanges}
                                handleNombreBlur={servicios.handleNombreBlur}
                                handleSubmit={servicios.handleSubmit}
                                onCancel={servicios.goToBackToList}
                                abrirModalCategorias={() => setOpenCategoriasModalLocal(true)}
                                obtenerNombreCategoria={obtenerNombreCategoriaLocal}
                            />
                        )}
                    </div>
                )}

                {/* Modal de categorías */}
                <ModalCategorias
                    open={openCategoriasModalLocal}
                    onClose={() => {
                        setOpenCategoriasModalLocal(false);
                        setCategoriaBusquedaLocal("");
                    }}
                    categoriasFiltradas={categoriasFiltradasLocales}
                    categoriaBusqueda={categoriaBusquedaLocal}
                    setCategoriaBusqueda={setCategoriaBusquedaLocal}
                    onSelectCategoria={handleSelectCategoria}
                    categoriaSeleccionada={servicios.values.CategoriaId}
                />

                <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            </div>
        </div>
    );
};