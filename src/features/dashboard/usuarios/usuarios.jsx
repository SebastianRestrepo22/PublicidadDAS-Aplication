import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from "../components/paginacion/pagination.jsx";
import { useUsuarios } from "./hooks/useUsuarios";
import { UsuarioFilters } from "./components/UsuarioFilters.jsx";
import { UsuarioTable } from "./components/UsuarioTable.jsx";
import { UsuarioModalForm } from "./components/UsuarioModalForm.jsx";
import { UsuarioViewModal } from "./components/UsuarioViewModal.jsx";
import { UsuarioDeleteModal } from "./components/UsuarioDeleteModal.jsx";

export const Usuarios = () => {
  const {
    values,
    submitted,
    cargando,
    cargandoFormulario,
    paginatedData,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    editData,
    openCreate,
    openEditar,
    openVer,
    openEliminar,
    filtroCampo,
    filtroValor,
    tiposDocumento,
    roles,
    correoError,
    cedulaError,
    telefonoError,
    cedulaFormatoError,
    telefonoFormatoError,
    nombreError,
    setOpenCreate,
    setOpenEditar,
    setOpenVer,
    setOpenEliminar,
    setFiltroCampo,
    setFiltroValor,
    handleChanges,
    handleCorreoBlur,
    handleCedulaBlur,
    handleTelefonoBlur,
    handleSubmit,
    handleDelete,
    handlePageChange,
    handleItemsPerPageChange,
    handleEditClick,
    handleViewClick,
    handleDeleteClick,
    resetForm
  } = useUsuarios();

  const handleNewUser = () => {
    resetForm();
    setOpenCreate(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de usuarios</h1>

        <UsuarioFilters
          filtroCampo={filtroCampo}
          filtroValor={filtroValor}
          setFiltroCampo={setFiltroCampo}
          setFiltroValor={setFiltroValor}
          onNewUser={handleNewUser}
        />

        <UsuarioModalForm
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          title="Nuevo usuario"
          values={values}
          submitted={submitted}
          cargandoFormulario={cargandoFormulario}
          tiposDocumento={tiposDocumento}
          roles={roles}
          handleChanges={handleChanges}
          handleCorreoBlur={handleCorreoBlur}
          handleCedulaBlur={handleCedulaBlur}
          handleTelefonoBlur={handleTelefonoBlur}
          handleSubmit={handleSubmit}
          correoError={correoError}
          cedulaError={cedulaError}
          telefonoError={telefonoError}
          cedulaFormatoError={cedulaFormatoError}
          telefonoFormatoError={telefonoFormatoError}
          nombreError={nombreError}
          resetForm={resetForm}
        />

        <UsuarioModalForm
          open={openEditar}
          onClose={() => setOpenEditar(false)}
          title="Editar usuario"
          values={values}
          submitted={submitted}
          cargandoFormulario={cargandoFormulario}
          tiposDocumento={tiposDocumento}
          roles={roles}
          handleChanges={handleChanges}
          handleCorreoBlur={handleCorreoBlur}
          handleCedulaBlur={handleCedulaBlur}
          handleTelefonoBlur={handleTelefonoBlur}
          handleSubmit={handleSubmit}
          correoError={correoError}
          cedulaError={cedulaError}
          telefonoError={telefonoError}
          cedulaFormatoError={cedulaFormatoError}
          telefonoFormatoError={telefonoFormatoError}
          nombreError={nombreError}
          resetForm={resetForm}
        />

        <UsuarioViewModal
          open={openVer}
          onClose={() => setOpenVer(false)}
          editData={editData}
          tiposDocumento={tiposDocumento}
        />

        <UsuarioDeleteModal
          open={openEliminar}
          onClose={() => setOpenEliminar(false)}
          onConfirm={handleDelete}
          cargandoFormulario={cargandoFormulario}
          editData={editData}
        />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {cargando ? (
            <div className="text-center py-12">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
              <p className="mt-3 text-slate-600">Cargando usuarios...</p>
            </div>
          ) : (
            <>
              <UsuarioTable
                paginatedData={paginatedData}
                tiposDocumento={tiposDocumento}
                onEdit={handleEditClick}
                onView={handleViewClick}
                onDelete={handleDeleteClick}
              />
              {paginatedData && paginatedData.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </>
          )}
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </div>
  );
};