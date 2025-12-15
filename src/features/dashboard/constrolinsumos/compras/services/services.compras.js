
import axios from "axios";

const API_BASE = 'http://localhost:3000/api';

// === Compras ===

/**
 * Obtiene todas las compras
 */
export const getAllCompras = async () => {
  const response = await axios.get(`${'http://localhost:3000/api'}/compras`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Obtiene una compra por ID
 */
export const getCompraById = async (id) => {
  const response = await axios.get(`${'http://localhost:3000/api'}/compras/${id}`);
  return response.data;
};

/**
 * Crea una nueva compra
 * @param {Object} compraData - Datos de la compra (ProveedorId, FechaRegistro, Total, Estado)
 * @returns {Object} La compra creada
 */
export const createCompra = async (compraData) => {
  const response = await axios.post(`${'http://localhost:3000/api'}/compras`, compraData);
  return response.data;
};

/**
 * Actualiza una compra existente
 * @param {number} id - ID de la compra
 * @param {Object} compraData - Datos actualizados
 * @returns {Object} Resultado de la actualización
 */
export const updateCompra = async (id, compraData) => {
  const response = await axios.put(`${'http://localhost:3000/api'}/compras/${id}`, compraData);
  return response.data;
};

/**
 * Elimina una compra
 * @param {number} id - ID de la compra
 * @returns {Object} Resultado de la eliminación
 */
export const deleteCompra = async (id) => {
  const response = await axios.delete(`${'http://localhost:3000/api'}/compras/${id}`);
  return response.data;
};

// === Detalles de Compra ===

/**
 * Obtiene todos los detalles de una compra por ID de compra
 * @param {number} compraId - ID de la compra
 * @returns {Array} Lista de detalles
 */
export const getDetallesByCompraId = async (compraId) => {
  const response = await axios.get(`${'http://localhost:3000/api'}/detalle-compras/compra/${compraId}`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Crea un nuevo detalle de compra
 * @param {Object} detalleData - Datos del detalle (CompraId, TipoDetalle, ProductoServicioId/InsumoId, Cantidad, PrecioUnitario, Descripcion)
 * @returns {Object} El detalle creado
 */
export const createDetalleCompra = async (detalleData) => {
  const response = await axios.post(`${'http://localhost:3000/api'}/detalle-compras`, detalleData);
  return response.data;
};

/**
 * Elimina un detalle de compra por su ID
 * @param {number} detalleId - ID del detalle
 * @returns {Object} Resultado de la eliminación
 */
export const deleteDetalleCompra = async (detalleId) => {
  const response = await axios.delete(`${'http://localhost:3000/api'}/detalle-compras/${detalleId}`);
  return response.data;
};

// === Catálogos (productos, insumos, proveedores) ===

/**
 * Obtiene todos los productos/servicios (endpoint externo en tu API: `/service`)
 */
export const getAllProductos = async () => {
  const response = await axios.get("http://localhost:3000/service");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Obtiene todos los insumos
 */
export const getAllInsumos = async () => {
  const response = await axios.get(`${'http://localhost:3000/api'}/insumos`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getAllProveedores = async () => {
  const res = await axios.get("http://localhost:3000/api/proveedores");
  return res.data;
};

/**
 * Obtiene proveedores con paginación y búsqueda
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @param {string} search - Término de búsqueda
 * @returns {Object} { data, total, totalPages }
 */
export const getProveedoresPaginados = async (page = 1, limit = 5, search = "") => {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (search) params.set("search", search);

  const response = await axios.get(`${'http://localhost:3000/api'}/proveedores?${params.toString()}`);

  // Asume que tu backend devuelve { data, total } o similar
  if (response.data && Array.isArray(response.data.data)) {
    return {
      data: response.data.data,
      total: response.data.total || response.data.data.length,
    };
  } else if (Array.isArray(response.data)) {
    // Si no hay paginación en el backend, se simula
    const total = response.data.length;
    const start = (page - 1) * limit;
    const paginated = response.data.slice(start, start + limit);
    return {
      data: paginated,
      total,
    };
  } else {
    return { data: [], total: 0 };
  }
};

/**
 * Obtiene productos o insumos con paginación y filtrado
 * @param {string} type - "producto", "insumo", o "todos"
 * @param {number} page
 * @param {number} limit
 * @param {string} search
 * @returns {Object} { data, total }
 */
export const getProductosInsumosPaginados = async (type = "todos", page = 1, limit = 5, search = "") => {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (search) params.set("search", search);

  if (type === "producto") {
    const res = await axios.get(`http://localhost:3000/service?${params.toString()}`);
    const data = Array.isArray(res.data) ? res.data.map(p => ({ ...p, tipo: "producto" })) : [];
    return { data, total: data.length };
  } else if (type === "insumo") {
    const res = await axios.get(`${'http://localhost:3000/api'}/insumos?${params.toString()}`);
    const data = Array.isArray(res.data) ? res.data.map(i => ({ ...i, tipo: "insumo" })) : [];
    return { data, total: data.length };
  } else {
    const [resProd, resIns] = await Promise.all([
      axios.get(`http://localhost:3000/service?${params.toString()}`),
      axios.get(`${'http://localhost:3000/api'}/insumos?${params.toString()}`)
    ]);
    const productos = Array.isArray(resProd.data) ? resProd.data.map(p => ({ ...p, tipo: "producto" })) : [];
    const insumos = Array.isArray(resIns.data) ? resIns.data.map(i => ({ ...i, tipo: "insumo" })) : [];
    const combined = [...productos, ...insumos];
    return { data: combined, total: combined.length };
  }
};