
import axios from "axios";
/**
 * Obtiene todos los pedidos de clientes con sus detalles
 */
export const getAllPedidosClientes = async () => {
  const response = await axios.get(`${'http://localhost:3000/api'}/pedidos-clientes`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Obtiene un pedido por ID
 */
export const getPedidoById = async (id) => {
  const response = await axios.get(`${'http://localhost:3000/api'}/pedidos-clientes/${id}`);
  return response.data;
};

/**
 * Crea un nuevo pedido
 */
export const createPedidoCliente = async (pedidoData) => {
  const response = await axios.post(`${'http://localhost:3000/api'}/pedidos-clientes`, pedidoData);
  return response.data;
};

/**
 * Actualiza un pedido existente
 */
export const updatePedidoCliente = async (id, pedidoData) => {
  const response = await axios.put(`${'http://localhost:3000/api'}/pedidos-clientes/${id}`, pedidoData);
  return response.data;
};

/**
 * Elimina un pedido
 */
export const deletePedidoCliente = async (id) => {
  const response = await axios.delete(`${'http://localhost:3000/api'}/pedidos-clientes/${id}`);
  return response.data;
};

/**
 * Obtiene los detalles de un pedido por su ID
 */
export const getDetallesByPedidoId = async (pedidoId) => {
  const response = await axios.get(`${'http://localhost:3000/api'}/detalle-pedido/${pedidoId}`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Obtiene productos
 * ✅ Ruta CORRECTA: /producto (singular, sin /api)
 */
export const getAllProductos = async () => {
  const response = await axios.get(`${'http://localhost:3000'}/producto`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Obtiene servicios
 * ✅ Ruta CORRECTA: /servicio (singular, sin /api)
 */
export const getAllServicios = async () => {
  const response = await axios.get(`${'http://localhost:3000'}/servicio`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Obtiene todos los colores
 *  Ruta CORRECTA: /colores (plural, sin /api)
 */
export const getAllColores = async () => {
  const response = await axios.get(`${'http://localhost:3000'}/colores`);
  return Array.isArray(response.data) ? response.data : [];
};