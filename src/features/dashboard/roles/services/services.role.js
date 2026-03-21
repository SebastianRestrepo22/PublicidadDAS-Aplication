import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + '/';

// Listar todos los datos
export const GetDataRoles = async (page = 1, limit = 10, filtroCampo = null, filtroValor = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filtroCampo && filtroValor && { filtroCampo, filtroValor })
    });
    
    const response = await axios.get(`${API_URL}roles?${params}`);
    return response.data;
  } catch (error) {
    return { data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit }, error };
  }
};

// Crear rol
export const postDataRoles = async (data) => {
  try {
    const response = await axios.post(`${API_URL}roles`, data);
    return response;
  } catch (error) {
    return { status: false, message: "Error al crear rol", error };
  }
};

// Actualizar un registro
export const updateDataRol = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}roles/${id}`, data);
    return response;
  } catch (error) {
    return { status: false, message: "Error al actualizar rol", error };
  }
};

// Eliminar un registro
export const deleteDataRol = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}roles/${id}`);
    return response;
  } catch (error) {
    return { status: false, message: "Error al eliminar rol", error };
  }
};

// Buscar roles
export const buscarRoles = async (campo, valor, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      campo,
      valor,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await axios.get(`${API_URL}roles/buscar?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error al buscar roles:", error);
    return { data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } };
  }
};

// ========== NUEVAS FUNCIONES PARA PERMISOS ==========

export const getPermissions = async () => {
  try {
    const response = await axios.get(`${API_URL}roles/permisos/todos`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    return [];
  }
};

export const getRolePermissions = async (roleId) => {
  try {
    const response = await axios.get(`${API_URL}roles/${roleId}/permisos`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener permisos del rol:", error);
    return [];
  }
};

export const updateRolePermissions = async (roleId, permisos) => {
  try {
    const response = await axios.put(`${API_URL}roles/${roleId}/permisos`, { permisos });
    return response;
  } catch (error) {
    console.error("Error al actualizar permisos:", error);
    throw error;
  }
};

export const getUserPermissions = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}roles/usuario/${userId}/permisos`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener permisos del usuario:", error);
    return [];
  }
};