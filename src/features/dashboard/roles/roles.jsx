import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Edit, Eye, Trash2, Shield, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import Modal from "../components/modals/modal.jsx";
import { buscarRoles, deleteDataRol, GetDataRoles, postDataRoles, updateDataRol, getPermissions, getRolePermissions, updateRolePermissions } from './services/services.role';
import axios from "axios";

//importamos toastify
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from "../components/paginacion/pagination.jsx";

function Toggle({ checked = false, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? "bg-green-500" : "bg-gray-300"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

export const Roles = () => {
  //Paginación
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({ Nombre: "", Estado: true, description: "" });
  const [editData, setEditData] = useState(null);

  // Nuevos estados para permisos
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionsByModule, setPermissionsByModule] = useState({});
  const [expandedModules, setExpandedModules] = useState([]); // Para expandir/contraer módulos

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [openPermissions, setOpenPermissions] = useState(false); // Nuevo modal para permisos

  const [filtroCampo, setFiltroCampo] = useState('');
  const [filtroValor, setFiltroValor] = useState('');

  // Manejar los errores debajo del imput
  const [submitted, setSubmitted] = useState(false);
  const [rolError, setRolError] = useState('');
  const [originalNombre, setOriginalNombre] = useState("");

  // Cargar todos los permisos disponibles
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const permisos = await getPermissions();
        setAllPermissions(permisos);

        // Agrupar permisos por módulo
        const grouped = permisos.reduce((acc, permiso) => {
          const modulo = permiso.Modulo || 'General';
          if (!acc[modulo]) acc[modulo] = [];
          acc[modulo].push(permiso);
          return acc;
        }, {});
        setPermissionsByModule(grouped);

        // Expandir todos los módulos por defecto
        setExpandedModules(Object.keys(grouped));
      } catch (error) {
        console.error('Error cargando permisos:', error);
      }
    };
    loadPermissions();
  }, []);

  // Cargar permisos de un rol cuando se abre el modal de permisos
  useEffect(() => {
    const loadRolePermissions = async () => {
      if (openPermissions && editData?.RoleId) {
        try {
          const permisos = await getRolePermissions(editData.RoleId);
          const permisoIds = permisos.map(p => p.PermisoId);
          setSelectedPermissions(permisoIds);
        } catch (error) {
          console.error('Error cargando permisos del rol:', error);
          setSelectedPermissions([]);
        }
      }
    };
    loadRolePermissions();
  }, [openPermissions, editData]);

  // Función para paginar
  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Función para cargar roles
  const cargarRoles = async () => {
    try {
      let resultados;
      if (filtroCampo && filtroValor) {
        resultados = await buscarRoles(filtroCampo, filtroValor);
      } else {
        const todos = await GetDataRoles();
        resultados = todos?.data || [];
      }

      setAllData(Array.isArray(resultados) ? resultados : []);
      setTotalItems(Array.isArray(resultados) ? resultados.length : 0);

      const totalPages = Math.ceil(resultados.length / itemsPerPage);
      setTotalPages(totalPages > 0 ? totalPages : 1);

      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }

      const paginatedData = paginateData(Array.isArray(resultados) ? resultados : []);
      setPaginatedData(paginatedData);
    } catch (error) {
      console.error(error);
      setRoles([]);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, [filtroCampo, filtroValor]);

  useEffect(() => {
    if (allData.length > 0) {
      const totalPages = Math.ceil(allData.length / itemsPerPage);
      setTotalPages(totalPages > 0 ? totalPages : 1);

      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }

      const paginatedData = paginateData(allData);
      setPaginatedData(paginatedData);
    }
  }, [itemsPerPage, currentPage, allData]);

  const handleRolBlur = async () => {
    if (formData.Nombre === originalNombre) return;

    try {
      const response = await axios.get(`http://localhost:3000/roles/validar-rol?rol=${formData.Nombre}`);
      if (response.data.exists) {
        setRolError('Este rol ya está registrado');
      } else {
        setRolError('');
      }
    } catch (error) {
      console.error('Error validando el rol:', error);
      setRolError('No se pudo validar el rol');
    }
  };

  const changeData = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleToggleEstado = async (roleId, nuevoEstado) => {
    try {
      const response = await axios.put(`http://localhost:3000/roles/${roleId}/estado`, {
        estado: nuevoEstado
      });
      toast.success(response.data.message);

      // Actualizar la lista después de cambiar estado
      await cargarRoles();
    } catch (error) {
      if (error.response?.data?.message) {
        toast.warning(error.response.data.message);
      } else {
        toast.error("No se pudo actualizar el estado del rol.");
      }
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

  const toggleModule = (module) => {
    setExpandedModules(prev =>
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const handleSelectAllModule = (module) => {
    const modulePermisos = permissionsByModule[module];
    const allModuleIds = modulePermisos.map(p => p.PermisoId);

    // Verificar si ya están todos seleccionados
    const allSelected = allModuleIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      // Deseleccionar todos
      setSelectedPermissions(prev => prev.filter(id => !allModuleIds.includes(id)));
    } else {
      // Seleccionar todos los que no están
      const newSelected = [...selectedPermissions];
      allModuleIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedPermissions(newSelected);
    }
  };

  const handleSelectAllPermissions = () => {
    const allPermisoIds = allPermissions.map(p => p.PermisoId);

    // Verificar si ya están todos seleccionados
    const allSelected = allPermisoIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      // Deseleccionar todos
      setSelectedPermissions([]);
    } else {
      // Seleccionar todos
      setSelectedPermissions(allPermisoIds);
    }
  };

  const handleSavePermissions = async () => {
    try {
      await updateRolePermissions(editData.RoleId, selectedPermissions);
      toast.success('Permisos actualizados correctamente');
      setOpenPermissions(false);
    } catch (error) {
      toast.error('Error al actualizar permisos');
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!formData.Nombre || !formData.Nombre.trim()) {
      setRolError('El nombre no puede ir vacío');
      return;
    }

    try {
      const validarRes = await axios.get(
        `http://localhost:3000/roles/validar-rol?rol=${encodeURIComponent(formData.Nombre.trim())}`
      );
      const exists = validarRes.data?.exists;

      if (exists && (!editData || formData.Nombre.trim() !== (originalNombre || "").trim())) {
        setRolError('Este rol ya está registrado');
        toast.warning('Ya existe un rol con ese nombre');
        return;
      }

      const estadoValido = formData.Estado === true ? "Activo" : "Inactivo";

      let response;
      if (editData && editData.RoleId) {
        response = await updateDataRol(editData.RoleId, { ...formData, Estado: estadoValido });
      } else {
        response = await postDataRoles({ ...formData, Estado: estadoValido });
      }

      if (response && (response.status === 200 || response.status === 201)) {
        // Actualizar la lista después de crear/editar
        await cargarRoles();
        toast.success(editData ? "Rol actualizado correctamente" : "Rol creado correctamente");
        handleCloseModal();
      } else {
        toast.error("Error al guardar el rol");
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      const serverMessage = error?.response?.data?.message;
      if (serverMessage) {
        setRolError(serverMessage);
        toast.warning(serverMessage);
      } else {
        toast.error("Error al procesar la solicitud");
      }
    }
  };

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
    setOriginalNombre(rol.Nombre || "");
    setRolError('');
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

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:3000/roles/${id}`);
      toast.success(response.data.message);

      // ACTUALIZAR LA LISTA INMEDIATAMENTE después de eliminar
      await cargarRoles();

      setOpenEliminar(false);
    } catch (error) {
      if (error.response?.data?.message) {
        toast.warning(error.response.data.message);
      } else {
        toast.error('Error al eliminar el rol');
      }
    }
  };

  const handleCloseModal = () => {
    setOpenCreate(false);
    setOpenEditar(false);
    setOpenVer(false);
    setOpenPermissions(false);
    setFormData({ Nombre: "", description: "", Estado: true });
    setEditData(null);
    setSelectedPermissions([]);
    setRolError('');
    setSubmitted(false);
  };

  useEffect(() => {
    if (openCreate || openEditar) {
      setSubmitted(false);
    }
  }, [openCreate, openEditar]);

  const renderForm = (type = "create") => {
    const buttonLabel = type === "create" ? "Crear" : type === "editar" ? "Guardar" : "Cerrar";

    return (
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 text-left">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Nombre del Rol</label>
          <input
            type="text"
            name="Nombre"
            placeholder="Ej: Administrador"
            value={formData.Nombre}
            onChange={changeData}
            onBlur={handleRolBlur}
            className={`w-full h-11 px-4 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 
            ${(submitted && !formData.Nombre.trim()) || rolError ? "border-red-500" : "border-gray-300"}`}
          />
          {(!formData.Nombre.trim() && submitted) ? (
            <p className="text-red-500 text-sm mt-1">El nombre no puede ir vacío</p>
          ) : rolError ? (
            <p className="text-red-500 text-sm mt-1">{rolError}</p>
          ) : null}
        </div>

        <div className="col-span-1 flex gap-4 mt-4">
          <button className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
            {buttonLabel}
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={handleCloseModal}
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  };

  const renderPermissionsModal = () => {
    if (!editData) return null;

    const totalSelected = selectedPermissions.length;
    const totalPermissions = allPermissions.length;

    return (
      <div className="text-left flex flex-col h-full">
        {/* Encabezado - fijo */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Asignar permisos a:</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {editData.Nombre}
            </div>
            <span className="text-sm text-gray-600">
              ({totalSelected} de {totalPermissions} permisos seleccionados)
            </span>
          </div>
        </div>

        {/* Controles globales - fijo */}
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectAllPermissions}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Check size={16} />
              {totalSelected === totalPermissions ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </button>
            <div className="text-sm text-gray-500">
              {Math.round((totalSelected / totalPermissions) * 100)}% seleccionado
            </div>
          </div>
        </div>

        {/* CONTENEDOR DE PERMISOS CON SCROLL - CORRECCIÓN COMPLETA */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto pr-2">
            {Object.keys(permissionsByModule).map((modulo) => {
              const modulePermisos = permissionsByModule[modulo];
              const moduleSelectedCount = modulePermisos.filter(p => selectedPermissions.includes(p.PermisoId)).length;
              const isModuleExpanded = expandedModules.includes(modulo);
              const isModuleAllSelected = modulePermisos.every(p => selectedPermissions.includes(p.PermisoId));

              return (
                <div key={modulo} className="border border-gray-200 rounded-lg overflow-hidden mb-3">
                  {/* Cabecera del módulo */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => toggleModule(modulo)}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${isModuleExpanded ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {isModuleExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 text-sm">{modulo}</h5>
                        <p className="text-xs text-gray-500">
                          {moduleSelectedCount} de {modulePermisos.length} permisos
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAllModule(modulo);
                      }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                    >
                      {isModuleAllSelected ? 'Deseleccionar' : 'Seleccionar'} todos
                    </button>
                  </div>

                  {/* Permisos del módulo (expandido) */}
                  {isModuleExpanded && (
                    <div className="p-3 bg-white border-t border-gray-100">
                      <div className="grid grid-cols-1 gap-2">
                        {modulePermisos.map((permiso) => {
                          const isSelected = selectedPermissions.includes(permiso.PermisoId);
                          return (
                            <div key={permiso.PermisoId}
                              className={`flex items-center p-2 rounded-md transition-colors ${isSelected ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}>
                              <button
                                type="button"
                                onClick={() => handlePermissionToggle(permiso.PermisoId)}
                                className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                              >
                                {isSelected && <Check size={10} className="text-white" />}
                              </button>
                              <label className="ml-2 cursor-pointer flex-1" onClick={() => handlePermissionToggle(permiso.PermisoId)}>
                                <div className="font-medium text-sm text-gray-800">{permiso.Nombre}</div>
                                {permiso.Descripcion && (
                                  <div className="text-xs text-gray-500 mt-0.5">{permiso.Descripcion}</div>
                                )}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones - fijos en la parte inferior */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Permisos seleccionados: </span>
              <span className="font-semibold text-blue-700">{totalSelected}</span>
              <span className="text-gray-500"> / {totalPermissions}</span>
            </div>
            <div className="text-xs text-gray-500">
              {totalSelected === 0 ? 'Sin permisos seleccionados' :
                totalSelected === totalPermissions ? 'Todos seleccionados' :
                  `${totalSelected} permisos`}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
              onClick={handleSavePermissions}
            >
              <Check size={16} />
              Guardar Permisos
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
              onClick={() => setOpenPermissions(false)}
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderView = () => {
    if (!editData) return null;

    return (
      <div className="text-left space-y-2">
        <p><strong>ID:</strong> {editData.RoleId}</p>
        <p><strong>Nombre:</strong> {editData.Nombre}</p>
        <p><strong>Estado:</strong> {editData.Estado}</p>
        <div className="mt-4 text-center">
          <button
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 w-[400px]"
            onClick={() => setOpenVer(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de roles</h1>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link
                onClick={() => {
                  setEditData(null);
                  setFormData({ Nombre: "", description: "", Estado: true });
                  setRolError('');
                  setOriginalNombre("");
                  setSubmitted(false);
                  setOpenCreate(true);
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow"
              >
                <Plus size={18} /> Nuevo rol
              </Link>

              {filtroCampo === "estado" ? (
                <select
                  value={filtroValor}
                  onChange={(e) => setFiltroValor(e.target.value)}
                  className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[160px]"
                >
                  <option value="">Seleccionar estado</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              ) : (
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={filtroValor}
                    onChange={(e) => setFiltroValor(e.target.value)}
                    type="text"
                    placeholder="Buscar roles"
                    className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
                  />
                </div>
              )}

              <select
                value={filtroCampo}
                onChange={(e) => setFiltroCampo(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[140px]">
                <option value="">Filtrar por campo</option>
                <option value="nombre">Nombre</option>
                <option value="estado">Estado</option>
              </select>
            </div>
          </div>

          {/* Modales */}
          <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
            <div className="w-[450px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
              <h3 className="text-lg font-black text-gray-800 mb-6">Nuevo rol</h3>
              {renderForm("create")}
            </div>
          </Modal>

          <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
            <div className="w-[450px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
              <h3 className="text-lg font-black text-gray-800 mb-6">Editar rol</h3>
              {renderForm("editar")}
            </div>
          </Modal>

          <Modal open={openVer} onClose={() => setOpenVer(false)}>
            <div className="w-[450px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
              <h3 className="text-lg font-black text-gray-800 mb-6">Ver rol</h3>
              {renderView()}
            </div>
          </Modal>

          {/* MODAL DE PERMISOS CORREGIDO */}
          <Modal open={openPermissions} onClose={() => setOpenPermissions(false)}>
            <div className="w-[700px] h-[85vh] p-6 mx-auto bg-white rounded-xl shadow-lg flex flex-col">
              <h3 className="text-lg font-black text-gray-800 mb-4 text-center">
                Gestión de Permisos
              </h3>
              {renderPermissionsModal()}
            </div>
          </Modal>

          <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}>
            <div className="w-[400px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
              <h3 className="text-lg font-black text-gray-800 mb-4">Eliminar rol</h3>
              <p className="mb-6 text-gray-600">¿Estás seguro de eliminar este rol?</p>
              <div className="flex gap-4">
                <button
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  onClick={() => handleDelete(editData.RoleId)}
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
                <button
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 font-medium"
                  onClick={() => setOpenEliminar(false)}
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </div>
          </Modal>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                  <tr>
                    <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">ID</th>
                    <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Nombre</th>
                    <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Estado</th>
                    <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((rol) => (
                      <tr key={rol.RoleId} className="hover:bg-slate-50 transition-colors duration-150">
                        <td className="py-4 px-6 text-sm text-slate-900 font-mono">{String(rol.RoleId).slice(0, 3)}</td>
                        <td className="py-4 px-6 text-sm text-slate-900 font-medium">{rol.Nombre}</td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center">
                            <Toggle
                              checked={rol.Estado === "Activo"}
                              onChange={(value) => handleToggleEstado(rol.RoleId, value ? "Activo" : "Inactivo")}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleEditClick(rol)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handlePermissionsClick(rol)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Permisos"
                            >
                              <Shield size={16} />
                            </button>
                            <button
                              onClick={() => handleViewClick(rol)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Ver"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(rol)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8">
                        <div className="text-gray-500">
                          <p className="text-lg font-medium">No se encontraron roles</p>
                          <p className="text-sm mt-1">Intenta con otros filtros o crea un nuevo rol</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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