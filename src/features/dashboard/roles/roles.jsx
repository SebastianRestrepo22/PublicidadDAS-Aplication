import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Modal from "../components/modals/modal.jsx";
import { Pagination } from "../components/paginacion/pagination.jsx";
import { RolFilters } from "./components/RolFilters.jsx";
import { RolTable } from "./components/RolTable.jsx";
import { RolForm } from "./components/RolForm.jsx";
import { RolView } from "./components/RolView.jsx";
import { RolDelete } from "./components/RolDelete.jsx";
import { PermissionsModal } from "./components/PermissionsModal.jsx";
import { useRoles } from "./hooks/useRoles";

export const Roles = () => {
  const {
    paginatedData,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    formData,
    editData,
    allPermissions,
    selectedPermissions,
    permissionsByModule,
    filtroCampo,
    filtroValor,
    
    // Estados de error
    submitted,
    rolError,
    originalNombre,
    
    setCurrentPage,
    setItemsPerPage,
    setFormData,
    setEditData,
    setSelectedPermissions,
    setFiltroCampo,
    setFiltroValor,
    setSubmitted,
    setRolError,
    setOriginalNombre,
    
    cargarRoles,
    handleToggleEstado,
    handleSubmit,
    handleDelete,
    handleSavePermissions,
    loadRolePermissions,
    resetFormErrors
  } = useRoles();

  // Estados para modales
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [openPermissions, setOpenPermissions] = useState(false);

  // Cargar permisos del rol cuando se abre el modal
  useEffect(() => {
    if (openPermissions && editData?.RoleId) {
      loadRolePermissions(editData.RoleId);
    }
  }, [openPermissions, editData]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleEditClick = (rol) => {
    setEditData(rol);
    setFormData({ ...rol, Estado: rol.Estado === "Activo" });
    setOpenEditar(true);
  };

  const handlePermissionsClick = (rol) => {
    setEditData(rol);
    setOpenPermissions(true);
  };

  const handleViewClick = (rol) => {
    setEditData(rol);
    setFormData({ ...rol, Estado: rol.Estado === "Activo" });
    setOpenVer(true);
  };

  const handleDeleteClick = (rol) => {
    setEditData(rol);
    setOpenEliminar(true);
  };

  const handleNewRol = () => {
    setEditData(null);
    setFormData({ Nombre: "", description: "", Estado: true });
    resetFormErrors(); // Limpiar errores al abrir nuevo rol
    setOpenCreate(true);
  };

  const handleCloseModal = () => {
    setOpenCreate(false);
    setOpenEditar(false);
    setOpenVer(false);
    setOpenPermissions(false);
    setOpenEliminar(false);
    setFormData({ Nombre: "", description: "", Estado: true });
    setEditData(null);
    setSelectedPermissions([]);
    resetFormErrors(); // Limpiar errores al cerrar cualquier modal
  };

  const handleFormSubmit = async (e) => {
    const success = await handleSubmit(e);
    if (success) {
      handleCloseModal();
    }
  };

  const handleDeleteConfirm = async (id) => {
    const success = await handleDelete(id);
    if (success) {
      setOpenEliminar(false);
    }
  };

  const handlePermissionToggle = (permisoId) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permisoId)) {
        return prev.filter(id => id !== permisoId);
      } else {
        return [...prev, permisoId];
      }
    });
  };

  const handleSelectAllModule = (module) => {
    const modulePermisos = permissionsByModule[module];
    const allModuleIds = modulePermisos.map(p => p.PermisoId);

    const allSelected = allModuleIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !allModuleIds.includes(id)));
    } else {
      const newSelected = [...selectedPermissions];
      allModuleIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedPermissions(newSelected);
    }
  };

  const handleSelectAllPermissions = (clear = false) => {
    if (clear) {
      setSelectedPermissions([]);
    } else {
      const allPermisoIds = allPermissions.map(p => p.PermisoId);
      const allSelected = allPermisoIds.every(id => selectedPermissions.includes(id));
      
      if (allSelected) {
        setSelectedPermissions([]);
      } else {
        setSelectedPermissions(allPermisoIds);
      }
    }
  };

  const handleSavePermissionsClick = async () => {
    const success = await handleSavePermissions();
    if (success) {
      setOpenPermissions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de roles</h1>

          <RolFilters
            filtroCampo={filtroCampo}
            setFiltroCampo={setFiltroCampo}
            filtroValor={filtroValor}
            setFiltroValor={setFiltroValor}
            onNewRol={handleNewRol}
          />

          {/* Modales */}
          <Modal open={openCreate} onClose={handleCloseModal}>
            <div className="w-[450px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
              <h3 className="text-lg font-black text-gray-800 mb-6">Nuevo rol</h3>
              <RolForm
                formData={formData}
                setFormData={setFormData}
                editData={editData}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseModal}
                type="create"
                submitted={submitted}
                setSubmitted={setSubmitted}
                rolError={rolError}
                setRolError={setRolError}
                originalNombre={originalNombre}
                setOriginalNombre={setOriginalNombre}
              />
            </div>
          </Modal>

          <Modal open={openEditar} onClose={handleCloseModal}>
            <div className="w-[450px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
              <h3 className="text-lg font-black text-gray-800 mb-6">Editar rol</h3>
              <RolForm
                formData={formData}
                setFormData={setFormData}
                editData={editData}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseModal}
                type="editar"
                submitted={submitted}
                setSubmitted={setSubmitted}
                rolError={rolError}
                setRolError={setRolError}
                originalNombre={originalNombre}
                setOriginalNombre={setOriginalNombre}
              />
            </div>
          </Modal>

          <Modal open={openVer} onClose={handleCloseModal}>
            <div className="w-[450px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
              <h3 className="text-lg font-black text-gray-800 mb-6">Ver rol</h3>
              <RolView editData={editData} onClose={() => setOpenVer(false)} />
            </div>
          </Modal>

          <Modal open={openPermissions} onClose={handleCloseModal}>
            <div className="w-[700px] h-[85vh] p-6 mx-auto bg-white rounded-xl shadow-lg flex flex-col">
              <h3 className="text-lg font-black text-gray-800 mb-4 text-center">
                Gestión de Permisos
              </h3>
              <PermissionsModal
                editData={editData}
                allPermissions={allPermissions}
                permissionsByModule={permissionsByModule}
                selectedPermissions={selectedPermissions}
                onPermissionToggle={handlePermissionToggle}
                onSelectAllModule={handleSelectAllModule}
                onSelectAllPermissions={handleSelectAllPermissions}
                onSave={handleSavePermissionsClick}
                onClose={() => setOpenPermissions(false)}
              />
            </div>
          </Modal>

          <Modal open={openEliminar} onClose={handleCloseModal}>
            <RolDelete
              editData={editData}
              onDelete={handleDeleteConfirm}
              onCancel={() => setOpenEliminar(false)}
            />
          </Modal>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <RolTable
              roles={paginatedData}
              onEdit={handleEditClick}
              onPermissions={handlePermissionsClick}
              onView={handleViewClick}
              onDelete={handleDeleteClick}
              onToggleEstado={handleToggleEstado}
            />

            {paginatedData.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </div>
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