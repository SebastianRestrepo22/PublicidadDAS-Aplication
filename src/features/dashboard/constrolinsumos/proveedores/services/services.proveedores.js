import axios from "axios";
const API_BASE = 'http://localhost:3000/api';

// === Proveedores ===

/**
 * Obtiene todos los proveedores
 * @returns {Array} Lista de proveedores
 */
export const getAllProveedores = async () => {
  const response = await axios.get(`${'http://localhost:3000/api'}/proveedores`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Obtiene un proveedor por su ID
 * @param {number|string} id - ID del proveedor
 * @returns {Object} Datos del proveedor
 */
export const getProveedorById = async (id) => {
  const response = await axios.get(`${'http://localhost:3000/api'}/proveedores/${id}`);
  return response.data;
};

/**
 * Crea un nuevo proveedor
 * @param {Object} proveedorData - Datos del proveedor (nombreProveedor, telefono, correo, direccion, estado)
 * @returns {Object} El proveedor creado
 */
export const createProveedor = async (proveedorData) => {
  const response = await axios.post(`${'http://localhost:3000/api'}/proveedores`, proveedorData);
  return response.data;
};

/**
 * Actualiza un proveedor existente
 * @param {number|string} id - ID del proveedor
 * @param {Object} proveedorData - Datos actualizados
 * @returns {Object} Resultado de la actualización
 */
export const updateProveedor = async (id, proveedorData) => {
  const response = await axios.put(`${'http://localhost:3000/api'}/proveedores/${id}`, proveedorData);
  return response.data;
};

/**
 * Elimina un proveedor por su ID
 * @param {number|string} id - ID del proveedor
 * @returns {Object} Resultado de la eliminación
 */
export const deleteProveedor = async (id) => {
  const response = await axios.delete(`${'http://localhost:3000/api'}/proveedores/${id}`);
  return response.data;
};

// === Funciones adicionales (búsqueda y paginación) ===

/**
 * Obtiene proveedores con paginación y búsqueda
 * @param {number} page - Página actual (por defecto: 1)
 * @param {number} limit - Límite por página (por defecto: 5)
 * @param {string} search - Término de búsqueda (opcional)
 * @returns {Object} { data: Array, total: number }
 */
export const getProveedoresPaginados = async (page = 1, limit = 5, search = "") => {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (search) params.set("search", search);

  const response = await axios.get(`${'http://localhost:3000/api'}/proveedores?${params.toString()}`);

  // Si el backend devuelve estructura paginada: { data: [...], total: N }
  if (response.data && Array.isArray(response.data.data)) {
    return {
      data: response.data.data,
      total: response.data.total || 0,
    };
  }

  // Si el backend devuelve directamente un array (sin paginación real)
  if (Array.isArray(response.data)) {
    const total = response.data.length;
    const start = (page - 1) * limit;
    const paginated = response.data.slice(start, start + limit);
    return {
      data: paginated,
      total,
    };
  }

  // Caso fallback
  return { data: [], total: 0 };
};