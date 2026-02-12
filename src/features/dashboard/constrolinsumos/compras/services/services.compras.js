import axios from "axios";

// Cambia esta constante:
const API_BASE = 'http://localhost:3000';

// === Compras ===

export const getAllCompras = async () => {
  const response = await axios.get(`${'http://localhost:3000'}/api/compras`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getCompraById = async (id) => {
  const response = await axios.get(`${'http://localhost:3000'}/api/compras/${id}`);
  return response.data;
};

export const createCompra = async (compraData) => {
  const response = await axios.post(`${'http://localhost:3000'}/api/compras`, compraData);
  return response.data;
};

export const updateCompra = async (id, compraData) => {
  const response = await axios.put(`${'http://localhost:3000'}/api/compras/${id}`, compraData);
  return response.data;
};

export const deleteCompra = async (id) => {
  const response = await axios.delete(`${'http://localhost:3000'}/api/compras/${id}`);
  return response.data;
};

// === Detalles de Compra ===

export const getDetallesByCompraId = async (compraId) => {
  const response = await axios.get(`${'http://localhost:3000'}/api/detalle-compras/compra/${compraId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const createDetalleCompra = async (detalleData) => {
  const response = await axios.post(`${'http://localhost:3000'}/api/detalle-compras`, detalleData);
  return response.data;
};

export const deleteDetalleCompra = async (detalleId) => {
  const response = await axios.delete(`${'http://localhost:3000'}/api/detalle-compras/${detalleId}`);
  return response.data;
};

// === Catálogos (productos, insumos, proveedores) ===

export const getAllProductos = async () => {
  const response = await axios.get(`${'http://localhost:3000'}/producto`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getAllInsumos = async () => {
  const response = await axios.get(`${'http://localhost:3000'}/api/insumos`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getAllProveedores = async () => {
  const response = await axios.get(`${'http://localhost:3000'}/api/proveedores`);
  return response.data;
};

export const getProveedoresPaginados = async (page = 1, limit = 5, search = "") => {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (search) params.set("search", search);

  const response = await axios.get(`${'http://localhost:3000'}/api/proveedores?${params.toString()}`);

  if (response.data && Array.isArray(response.data.data)) {
    return {
      data: response.data.data,
      total: response.data.total || response.data.data.length,
    };
  } else if (Array.isArray(response.data)) {
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

export const getProductosInsumosPaginados = async (type = "todos", page = 1, limit = 5, search = "") => {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (search) params.set("search", search);

  if (type === "producto") {
    const res = await axios.get(`${'http://localhost:3000'}/producto?${params.toString()}`);
    const data = Array.isArray(res.data) ? res.data.map(p => ({ ...p, tipo: "producto" })) : [];
    return { data, total: data.length };
  } else if (type === "insumo") {
    const res = await axios.get(`${'http://localhost:3000'}/api/insumos?${params.toString()}`);
    const data = Array.isArray(res.data) ? res.data.map(i => ({ ...i, tipo: "insumo" })) : [];
    return { data, total: data.length };
  } else {
    const [resProd, resIns] = await Promise.all([
      axios.get(`${'http://localhost:3000'}/producto?${params.toString()}`),
      axios.get(`${'http://localhost:3000'}/api/insumos?${params.toString()}`)
    ]);
    const productos = Array.isArray(resProd.data) ? resProd.data.map(p => ({ ...p, tipo: "producto" })) : [];
    const insumos = Array.isArray(resIns.data) ? resIns.data.map(i => ({ ...i, tipo: "insumo" })) : [];
    const combined = [...productos, ...insumos];
    return { data: combined, total: combined.length };
  }
};