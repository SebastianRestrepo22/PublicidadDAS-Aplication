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

    // Hook de servicios
    // ServiciosDashboard.jsx - Agrega el callback

    // Hook de servicios
    const {
        values,
        setValues,
        tamanos,
        setTamanos,
        estadoEdit,
        setEstadoEdit,
        submitted,
        setSubmitted,
        nombreError,
        editData,
        setEditData,
        openEliminar,
        setOpenEliminar,
        isSubmitting,
        handleChanges,
        handleNombreBlur,
        handleToggleEstado,
        handleDelete,
        handleDeleteClick,
        handleSubmit,
        goToBackToList,
        goToCreate,
        goToView,
        goToEdit,
        resetForm,
        allData: serviciosData,
        setAllData: setServiciosData,
        actualizarPaginacion // 🔥 Nueva función
    } = useServicios(mode, id);

    // Hook de paginación - con callback
    const {
        paginatedData,
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
    } = usePaginacion(
        mode,
        serviciosData,
        setServiciosData,
        actualizarPaginacion 
    );
    const {
        categorias,
        openCategoriasModal,
        setOpenCategoriasModal,
        categoriaBusqueda,
        setCategoriaBusqueda,
        categoriasFiltradas,
        seleccionarCategoria,
        obtenerNombreCategoria
    } = useCategorias(values, setValues);

    // Navegación
    const handleViewClick = (servicio) => {
        goToView(servicio.ServicioId);
    };

    const handleEditClick = (servicio) => {
        if (servicio.Estado === 'Activo') {
            goToEdit(servicio.ServicioId);
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
                            onNewClick={goToCreate}
                            filtroEstado={filtroEstado}
                            setFiltroEstado={setFiltroEstado}
                            filtroValor={filtroValor}
                            setFiltroValor={setFiltroValor}
                            filtroCampo={filtroCampo}
                            setFiltroCampo={setFiltroCampo}
                        />

                        <ModalEliminar
                            open={openEliminar}
                            onClose={() => {
                                setOpenEliminar(false);
                                setEditData(null); // Limpiar editData al cerrar
                            }}
                            editData={editData}
                            onConfirm={handleDelete}
                        />

                        <TablaServicios
                            paginatedData={paginatedData}
                            categorias={categorias}
                            onView={handleViewClick}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            onToggleEstado={handleToggleEstado}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </>
                )}

                {(mode === "create" || mode === "edit" || mode === "view") && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
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
                                editData={editData}
                                categorias={categorias}
                                tamanos={tamanos}
                                onEdit={goToEdit}
                                onDelete={handleDeleteClick}
                                onBack={goToBackToList}
                            />
                        ) : (
                            <FormularioServicio
                                mode={mode}
                                values={values}
                                setValues={setValues}
                                tamanos={tamanos}
                                setTamanos={setTamanos}
                                estadoEdit={estadoEdit}
                                setEstadoEdit={setEstadoEdit}
                                submitted={submitted}
                                nombreError={nombreError}
                                isSubmitting={isSubmitting}
                                handleChanges={handleChanges}
                                handleNombreBlur={handleNombreBlur}
                                handleSubmit={handleSubmit}
                                onCancel={goToBackToList}
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
                    categoriaSeleccionada={values.CategoriaId}
                />

                <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            </div>
        </div>
    );
};