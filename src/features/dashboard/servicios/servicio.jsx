import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft } from "lucide-react";

import { useServicios } from "./hooks/useServicios";
import { useCategorias } from "./hooks/useCategorias";
import { usePaginacion } from "./hooks/usePaginacion";

import { BarraAcciones } from "./components/BarraAcciones";
import { TablaServicios } from "./components/TablaServicios";
import { FormularioServicio } from "./components/FormularioServicio";
import { DetalleServicio } from "./components/DetalleServicio";
import { ModalCategorias } from "./components/ModalCategorias";
import { ModalEliminar } from "./components/ModalEliminar";

export const ServiciosDashboard = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const mode = React.useMemo(() => {
        if (location.pathname === "/dashboard/servicio/nuevo") return "create";
        if (id && location.pathname === `/dashboard/servicio/${id}/editar`) return "edit";
        if (id && location.pathname === `/dashboard/servicio/${id}`) return "view";
        return "list";
    }, [location.pathname, id]);

    const paginacion = usePaginacion(mode);
    const servicios = useServicios(mode, id, paginacion.refrescar);

    const {
        categorias,
        openCategoriasModal,
        setOpenCategoriasModal,
        categoriaBusqueda,
        setCategoriaBusqueda,
        categoriasFiltradas,
        seleccionarCategoria,
        obtenerNombreCategoria
    } = useCategorias(servicios.values, servicios.setValues);

    const handleViewClick = (servicio) => {
        servicios.goToView(servicio.ServicioId);
    };

    const handleEditClick = (servicio) => {
        if (servicio.Estado === 'Activo') {
            servicios.goToEdit(servicio.ServicioId);
        }
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

                        <TablaServicios
                            paginatedData={paginacion.paginatedData}
                            categorias={categorias}
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
                                categorias={categorias}
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
                                abrirModalCategorias={() => setOpenCategoriasModal(true)}
                                obtenerNombreCategoria={obtenerNombreCategoria}
                            />
                        )}
                    </div>
                )}

                <ModalCategorias
                    open={openCategoriasModal}
                    onClose={() => setOpenCategoriasModal(false)}
                    categoriasFiltradas={categoriasFiltradas}
                    categoriaBusqueda={categoriaBusqueda}
                    setCategoriaBusqueda={setCategoriaBusqueda}
                    onSelectCategoria={seleccionarCategoria}
                    categoriaSeleccionada={servicios.values.CategoriaId}
                />

                <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            </div>
        </div>
    );
};