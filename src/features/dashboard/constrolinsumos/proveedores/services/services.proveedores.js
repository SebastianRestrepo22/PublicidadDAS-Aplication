import axios from "axios";
const API_BASE = 'http://localhost:3000/api';

// ========== FUNCIONES CON PAGINACIÓN (PARA TU MÓDULO) ==========

/**
 * Obtiene proveedores con paginación
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @param {string} filtroCampo - Campo para filtrar
 * @param {string} filtroValor - Valor del filtro
 * @returns {Object} { data: Array, pagination: {...} }
 */
export const getProveedoresPaginated = async (page = 1, limit = 5, filtroCampo = null, filtroValor = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filtroCampo && filtroValor && { filtroCampo, filtroValor })
    });
    
    const response = await axios.get(`${'http://localhost:3000/api'}/proveedores?${params}`);
    return response.data; // Devuelve { data: [...], pagination: {...} }
  } catch (error) {
    console.error("Error al obtener proveedores paginados:", error);
    return { data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } };
  }
};

/**
 * Busca proveedores con paginación
 * @param {string} campo - Campo a buscar
 * @param {string} valor - Valor a buscar
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @returns {Object} { data: Array, pagination: {...} }
 */
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

// ========== FUNCIONES PARA COMPATIBILIDAD ==========

/**
 * Obtiene TODOS los proveedores (sin paginación) - para compatibilidad
 * @returns {Array} Lista de proveedores
 */
export const getAllProveedores = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api'}/proveedores/todos`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al obtener todos los proveedores:", error);
    return [];
  }
};

/**
 * Obtiene un proveedor por su ID
 * @param {string} id - ID del proveedor
 * @returns {Object} Datos del proveedor
 */
export const getProveedorById = async (id) => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api'}/proveedores/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener proveedor por ID:", error);
    throw error;
  }
};

/**
 * Crea un nuevo proveedor
 * @param {Object} proveedorData - Datos del proveedor
 * @returns {Object} El proveedor creado
 */
export const createProveedor = async (proveedorData) => {
  try {
    const response = await axios.post(`${'http://localhost:3000/api'}/proveedores`, proveedorData);
    return response.data;
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    throw error;
  }
};

/**
 * Actualiza un proveedor existente
 * @param {string} id - ID del proveedor
 * @param {Object} proveedorData - Datos actualizados
 * @returns {Object} Resultado de la actualización
 */
export const updateProveedor = async (id, proveedorData) => {
  try {
    const response = await axios.put(`${'http://localhost:3000/api'}/proveedores/${id}`, proveedorData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    throw error;
  }
};

/**
 * Elimina un proveedor por su ID
 * @param {string} id - ID del proveedor
 * @returns {Object} Resultado de la eliminación
 */
export const deleteProveedor = async (id) => {
  try {
    const response = await axios.delete(`${'http://localhost:3000/api'}/proveedores/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    throw error;
  }
};