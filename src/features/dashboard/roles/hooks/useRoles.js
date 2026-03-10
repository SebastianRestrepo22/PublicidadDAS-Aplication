import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { buscarRoles, GetDataRoles, postDataRoles, updateDataRol, getPermissions, getRolePermissions, updateRolePermissions } from '../services/services.role';

export const useRoles = () => {
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({ Nombre: "", Estado: true, description: "" });
  const [editData, setEditData] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionsByModule, setPermissionsByModule] = useState({});
  const [filtroCampo, setFiltroCampo] = useState('');
  const [filtroValor, setFiltroValor] = useState('');
  
  // Estados para errores del formulario
  const [submitted, setSubmitted] = useState(false);
  const [rolError, setRolError] = useState('');
  const [originalNombre, setOriginalNombre] = useState('');

  // Cargar permisos
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const permisos = await getPermissions();
        setAllPermissions(permisos);
        
        const grouped = permisos.reduce((acc, permiso) => {
          const modulo = permiso.Modulo || 'General';
          if (!acc[modulo]) acc[modulo] = [];
          acc[modulo].push(permiso);
          return acc;
        }, {});
        setPermissionsByModule(grouped);
      } catch (error) {
        console.error('Error cargando permisos:', error);
      }
    };
    loadPermissions();
  }, []);

  // Cargar roles
  const cargarRoles = async () => {
    try {
      let resultado;
      if (filtroCampo && filtroValor) {
        resultado = await buscarRoles(filtroCampo, filtroValor, currentPage, itemsPerPage);
      } else {
        resultado = await GetDataRoles(currentPage, itemsPerPage);
      }

      const { data, pagination } = resultado;
      setAllData(data);
      setPaginatedData(data);
      setTotalItems(pagination.totalItems || 0);
      setTotalPages(pagination.totalPages || 1);

      if (currentPage > pagination.totalPages && pagination.totalPages > 0) {
        setCurrentPage(pagination.totalPages);
      }
    } catch (error) {
      console.error(error);
      setAllData([]);
      setPaginatedData([]);
      setTotalItems(0);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroCampo, filtroValor]);

  useEffect(() => {
    cargarRoles();
  }, [currentPage, itemsPerPage, filtroCampo, filtroValor]);

  const handleToggleEstado = async (roleId, nuevoEstado) => {
    try {
      const response = await axios.put(`http://localhost:3000/roles/${roleId}/estado`, {
        estado: nuevoEstado
      });
      toast.success(response.data.message);
      await cargarRoles();
    } catch (error) {
      if (error.response?.data?.message) {
        toast.warning(error.response.data.message);
      } else {
        toast.error("No se pudo actualizar el estado del rol.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!formData.Nombre || !formData.Nombre.trim()) {
      setRolError('El nombre no puede ir vacío');
      return;
    }

    if (rolError) return;

    try {
      const estadoValido = formData.Estado === true ? "Activo" : "Inactivo";

      let response;
      if (editData && editData.RoleId) {
        response = await updateDataRol(editData.RoleId, { ...formData, Estado: estadoValido });
      } else {
        response = await postDataRoles({ ...formData, Estado: estadoValido });
      }

      if (response && (response.status === 200 || response.status === 201)) {
        await cargarRoles();
        toast.success(editData ? "Rol actualizado correctamente" : "Rol creado correctamente");
        return true;
      } else {
        toast.error("Error al guardar el rol");
        return false;
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
      return false;
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:3000/roles/${id}`);
      toast.success(response.data.message);
      await cargarRoles();
      return true;
    } catch (error) {
      if (error.response?.data?.message) {
        toast.warning(error.response.data.message);
      } else {
        toast.error('Error al eliminar el rol');
      }
      return false;
    }
  };

  const handleSavePermissions = async () => {
    try {
      await updateRolePermissions(editData.RoleId, selectedPermissions);
      toast.success('Permisos actualizados correctamente');
      return true;
    } catch (error) {
      toast.error('Error al actualizar permisos');
      console.error(error);
      return false;
    }
  };

  const loadRolePermissions = async (roleId) => {
    try {
      const permisos = await getRolePermissions(roleId);
      const permisoIds = permisos.map(p => p.PermisoId);
      setSelectedPermissions(permisoIds);
    } catch (error) {
      console.error('Error cargando permisos del rol:', error);
      setSelectedPermissions([]);
    }
  };

  // Función para limpiar errores del formulario
  const resetFormErrors = () => {
    setSubmitted(false);
    setRolError('');
    setOriginalNombre('');
  };

  return {
    // Estados
    allData,
    paginatedData,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    roles,
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
    
    // Setters
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
    
    // Funciones
    cargarRoles,
    handleToggleEstado,
    handleSubmit,
    handleDelete,
    handleSavePermissions,
    loadRolePermissions,
    resetFormErrors
  };
};