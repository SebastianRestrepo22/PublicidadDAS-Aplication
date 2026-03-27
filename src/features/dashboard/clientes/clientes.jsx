import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useClientes } from './hooks/useClientes';
import { ClienteFilters } from './components/ClienteFilters';
import { ClienteTable } from './components/ClienteTable';
import { ClienteModalForm } from './components/ClienteModalForm';
import { ClienteViewModal } from './components/ClienteViewModal';
import { ClienteDeleteModal } from './components/ClienteDeleteModal';

export const Clientes = () => {
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
    correoError,
    cedulaError,
    telefonoError,
    cedulaFormatoError,
    telefonoFormatoError,
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
    handleLimpiarFiltros,
    handleEditClick,
    handleViewClick,
    handleDeleteClick,
    resetForm,
  } = useClientes();

  const handleNuevoCliente = () => {
    resetForm();
    setOpenCreate(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de clientes</h1>

        <ClienteFilters
          filtroCampo={filtroCampo}
          filtroValor={filtroValor}
          setFiltroCampo={setFiltroCampo}
          setFiltroValor={setFiltroValor}
          onLimpiarFiltros={handleLimpiarFiltros}
          onNuevoCliente={handleNuevoCliente}
        />

        <ClienteModalForm
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          title="Nuevo cliente"
          values={values}
          submitted={submitted}
          cargandoFormulario={cargandoFormulario}
          tiposDocumento={tiposDocumento}
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
          resetForm={resetForm}
        />

        <ClienteModalForm
          open={openEditar}
          onClose={() => setOpenEditar(false)}
          title="Editar cliente"
          values={values}
          submitted={submitted}
          cargandoFormulario={cargandoFormulario}
          tiposDocumento={tiposDocumento}
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
          resetForm={resetForm}
        />

        <ClienteViewModal
          open={openVer}
          onClose={() => setOpenVer(false)}
          editData={editData}
          tiposDocumento={tiposDocumento}
        />

        <ClienteDeleteModal
          open={openEliminar}
          onClose={() => setOpenEliminar(false)}
          onConfirm={handleDelete}
          cargandoFormulario={cargandoFormulario}
          editData={editData}
        />

        <ClienteTable
          paginatedData={paginatedData}
          tiposDocumento={tiposDocumento}
          cargando={cargando}
          onEdit={handleEditClick}
          onView={handleViewClick}
          onDelete={handleDeleteClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

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