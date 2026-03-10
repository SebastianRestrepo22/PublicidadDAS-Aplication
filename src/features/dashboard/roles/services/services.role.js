import axios from "axios"
const url = 'http://localhost:3000/'

// Listar todos los datos
export const GetDataRoles = async (page = 1, limit = 10, filtroCampo = null, filtroValor = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filtroCampo && filtroValor && { filtroCampo, filtroValor })
    });
    
    const response = await axios.get(`${url}roles?${params}`);
    return response.data; // Ahora devuelve { data: [...], pagination: {...} }
  } catch (error) {
    return { data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit }, error };
  }
};

// Crear rol
export const postDataRoles = async (data) => {
  try {
    const response = await axios.post(url + 'roles', data)
    return response
  } catch (error) {
    return { status: false, message: "Error al crear rol", error }
  }
}

// Actualizar un registro
export const updateDataRol = async (id, data) => {
  try {
    const response = await axios.put(url + `roles/${id}`, data);
    return response;
  } catch (error) {
    return { status: false, message: "Error al actualizar rol", error };
  }
}

// Eliminar un registro
export const deleteDataRol = async (id) => {
  try {
    const response = await axios.delete(url + `roles/${id}`);
    return response;
  } catch (error) {
    return { status: false, message: "Error al eliminar rol", error };
  }
}

// Buscar roles
export const buscarRoles = async (campo, valor, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      campo,
      valor,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await axios.get(`${url}roles/buscar?${params}`);
    return response.data; // Devuelve { data: [...], pagination: {...} }
  } catch (error) {
    console.error("Error al buscar roles:", error);
    return { data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } };
  }
};

// ========== NUEVAS FUNCIONES PARA PERMISOS ==========

// Obtener todos los permisos
export const getPermissions = async () => {
  try {
    const response = await axios.get(url + 'roles/permisos/todos');
    return response.data;
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    return [];
  }
}

// Obtener permisos de un rol
export const getRolePermissions = async (roleId) => {
  try {
    const response = await axios.get(url + `roles/${roleId}/permisos`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener permisos del rol:", error);
    return [];
  }
}

// Actualizar permisos de un rol
export const updateRolePermissions = async (roleId, permisos) => {
  try {
    const response = await axios.put(url + `roles/${roleId}/permisos`, { permisos });
    return response;
  } catch (error) {
    console.error("Error al actualizar permisos:", error);
    throw error;
  }
}

// Obtener permisos de un usuario
export const getUserPermissions = async (userId) => {
  try {
    const response = await axios.get(url + `roles/usuario/${userId}/permisos`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener permisos del usuario:", error);
    return [];
  }
}