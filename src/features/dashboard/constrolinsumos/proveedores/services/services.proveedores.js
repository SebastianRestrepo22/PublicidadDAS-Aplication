import axios from "axios";

const API_BASE = 'http://localhost:3000/api';

// ========== FUNCIONES CON PAGINACIÓN ==========
export const getProveedoresPaginated = async (page = 1, limit = 5, filtroCampo = null, filtroValor = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filtroCampo && filtroValor && { filtroCampo, filtroValor })
    });
    const response = await axios.get(`${'http://localhost:3000/api'}/proveedores?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener proveedores paginados:", error);
    return { data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } };
  }
};

export const buscarProveedores = async (campo, valor, page = 1, limit = 5) => {
  try {
    const params = new URLSearchParams({
      campo,
      valor,
      page: page.toString(),
      limit: limit.toString()
    });
    const response = await axios.get(`${'http://localhost:3000/api'}/proveedores/buscar?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error al buscar proveedores:", error);
    return { data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } };
  }
};

export const getAllProveedores = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api'}/proveedores/todos`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al obtener todos los proveedores:", error);
    return [];
  }
};

export const getProveedorById = async (id) => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api'}/proveedores/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener proveedor por ID:", error);
    throw error;
  }
};

export const createProveedor = async (proveedorData) => {
  try {
    const response = await axios.post(`${'http://localhost:3000/api'}/proveedores`, proveedorData);
    return response.data;
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    throw error;
  }
};

export const updateProveedor = async (id, proveedorData) => {
  try {
    const response = await axios.put(`${'http://localhost:3000/api'}/proveedores/${id}`, proveedorData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    throw error;
  }
};

export const deleteProveedor = async (id) => {
  try {
    const response = await axios.delete(`${'http://localhost:3000/api'}/proveedores/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    throw error;
  }
};

export const validarCampoUnico = async (campo, valor, excludeId = null) => {
  try {
    const params = new URLSearchParams({
      campo,
      valor
    });
    if (excludeId) {
      params.append('excludeId', excludeId);
    }
    const response = await axios.get(`${'http://localhost:3000/api'}/proveedores/validar-campo?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error en validarCampoUnico:', error);
    throw error;
  }
};