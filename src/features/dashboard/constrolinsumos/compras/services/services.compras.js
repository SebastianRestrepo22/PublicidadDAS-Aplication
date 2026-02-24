import axios from "axios";

// === Compras ===

export const getAllCompras = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/compras`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error en getAllCompras:", error);
    throw error;
  }
};

export const getCompraById = async (id) => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/compras/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error en getCompraById:", error);
    throw error;
  }
};

export const createCompra = async (compraData) => {
  try {
    const response = await axios.post(`${'http://localhost:3000'}/api/compras`, compraData);
    return response.data;
  } catch (error) {
    console.error("Error en createCompra:", error);
    throw error;
  }
};

export const updateCompra = async (id, compraData) => {
  try {
    const response = await axios.put(`${'http://localhost:3000'}/api/compras/${id}`, compraData);
    return response.data;
  } catch (error) {
    console.error("Error en updateCompra:", error);
    throw error;
  }
};

export const deleteCompra = async (id) => {
  try {
    const response = await axios.delete(`${'http://localhost:3000'}/api/compras/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error en deleteCompra:", error);
    throw error;
  }
};

// === Detalles de Compra ===

export const getDetallesByCompraId = async (compraId) => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/detalle-compras/compra/${compraId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error en getDetallesByCompraId:", error);
    throw error;
  }
};

export const createDetalleCompra = async (detalleData) => {
  try {
    // Asegurarnos de enviar solo los campos necesarios
    const dataToSend = {
      CompraId: detalleData.CompraId,
      ProductoId: detalleData.ProductoId,
      Cantidad: Number(detalleData.Cantidad),
      PrecioUnitario: Number(detalleData.PrecioUnitario),
      Descripcion: detalleData.Descripcion || ""
    };
    
    const response = await axios.post(`${'http://localhost:3000'}/api/detalle-compras`, dataToSend);
    return response.data;
  } catch (error) {
    console.error("Error en createDetalleCompra:", error);
    throw error;
  }
};

export const deleteDetalleCompra = async (detalleId) => {
  try {
    const response = await axios.delete(`${'http://localhost:3000'}/api/detalle-compras/${detalleId}`);
    return response.data;
  } catch (error) {
    console.error("Error en deleteDetalleCompra:", error);
    throw error;
  }
};

// === Catálogos (solo productos, sin insumos) ===

export const getAllProductos = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/producto`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error en getAllProductos:", error);
    throw error;
  }
};

export const getAllProveedores = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/proveedores`);
    return response.data;
  } catch (error) {
    console.error("Error en getAllProveedores:", error);
    throw error;
  }
};

export const getProveedoresPaginados = async (page = 1, limit = 5, search = "") => {
  try {
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
  } catch (error) {
    console.error("Error en getProveedoresPaginados:", error);
    throw error;
  }
};

export const getProductosPaginados = async (page = 1, limit = 5, search = "") => {
  try {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", limit);
    if (search) params.set("search", search);

    const response = await axios.get(`${'http://localhost:3000'}/producto?${params.toString()}`);
    
    const data = Array.isArray(response.data) ? response.data : [];
    
    return { 
      data, 
      total: data.length 
    };
  } catch (error) {
    console.error("Error en getProductosPaginados:", error);
    throw error;
  }
};