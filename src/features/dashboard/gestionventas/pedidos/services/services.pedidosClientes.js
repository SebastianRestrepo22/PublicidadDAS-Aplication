// src/services/pedidoClientesService.js

import axios from "axios";

const API_BASE = 'http://localhost:3000/api';

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
 * Obtiene productos/servicios (catálogo externo)
 */
export const getAllProductos = async () => {
  const response = await axios.get("http://localhost:3000/service");
  return Array.isArray(response.data) ? response.data : [];
};