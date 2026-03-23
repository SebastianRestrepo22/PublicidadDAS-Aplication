import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getComprasPaginated = async (page = 1, limit = 5, filtroCampo = null, filtroValor = null, sortBy = 'FechaRegistro', sortOrder = 'DESC') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });
    
    if (filtroCampo && filtroValor && filtroValor.trim() !== '') {
      params.append('filtroCampo', filtroCampo);
      params.append('filtroValor', filtroValor.trim());
    }
    
    // 🔥 CORREGIDO: Usar la ruta base '/' en lugar de '/paginated'
    const url = `${API_URL}/api/compras?${params}`;
    console.log("📤 getComprasPaginated - URL:", url);

    const response = await axios.get(url);
    
    console.log("✅ Respuesta getComprasPaginated:", {
      dataLength: response.data?.data?.length,
      pagination: response.data?.pagination,
      fullResponse: response.data
    });

    return {
      data: response.data?.data || [],
      pagination: {
        totalItems: response.data?.pagination?.total || 0,
        totalPages: response.data?.pagination?.totalPages || 1,
        currentPage: response.data?.pagination?.currentPage || page,
        itemsPerPage: response.data?.pagination?.itemsPerPage || limit
      }
    };
    
  } catch (error) {
    console.error("Error en getComprasPaginated:", error);
    return { 
      data: [], 
      pagination: { 
        totalItems: 0, 
        totalPages: 1, 
        currentPage: page, 
        itemsPerPage: limit 
      } 
    };
  }
};

export const buscarCompras = async (filtroCampo, filtroValor, page = 1, limit = 5) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    // Usar 'q' como parámetro de búsqueda
    if (filtroValor && filtroValor.trim() !== '') {
      params.append('q', filtroValor.trim());
    }
    
    console.log("🔍 Buscando compras con params:", params.toString());
    
    const response = await axios.get(`${API_URL}/api/compras/buscar?${params}`);
    
    console.log("Respuesta buscarCompras:", response.data);
    
    return {
      data: response.data?.data || [],
      pagination: {
        totalItems: response.data?.pagination?.totalItems || response.data?.pagination?.total || 0,
        totalPages: response.data?.pagination?.totalPages || 1,
        currentPage: response.data?.pagination?.currentPage || page,
        itemsPerPage: response.data?.pagination?.itemsPerPage || limit
      }
    };
    
  } catch (error) {
    console.error("❌ Error en buscarCompras:", error);
    return { 
      data: [], 
      pagination: { 
        totalItems: 0, 
        totalPages: 1, 
        currentPage: page, 
        itemsPerPage: limit 
      } 
    };
  }
};

export const getAllCompras = async () => {
  try {
    // 🔥 CORREGIDO: Usar la ruta /todas que sí existe
    const response = await axios.get(`${API_URL}/api/compras/todas`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Error en getAllCompras:", error);
    return [];
  }
};

export const getCompraById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/compras/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error en getCompraById:", error);
    throw error;
  }
};

export const createCompra = async (compraData) => {
  try {
    const response = await axios.post(`${API_URL}/api/compras`, compraData);
    return response.data;
  } catch (error) {
    console.error("❌ Error en createCompra:", error);
    throw error;
  }
};

export const updateCompra = async (id, compraData) => {
  try {
    const response = await axios.put(`${API_URL}/api/compras/${id}`, compraData);
    return response.data;
  } catch (error) {
    console.error("❌ Error en updateCompra:", error);
    throw error;
  }
};

export const deleteCompra = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/compras/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error en deleteCompra:", error);
    throw error;
  }
};

// ========== DETALLE COMPRAS ==========

export const getDetallesByCompraId = async (compraId) => {
  try {
    const response = await axios.get(`${API_URL}/api/detalle-compras/compra/${compraId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Error en getDetallesByCompraId:", error);
    return [];
  }
};

export const createDetalleCompra = async (detalleData) => {
  try {
    const dataToSend = {
      CompraId: detalleData.CompraId,
      ProductoId: detalleData.ProductoId,
      Cantidad: Number(detalleData.Cantidad) || 0,
      PrecioUnitario: Number(detalleData.PrecioUnitario) || 0,
      Descripcion: detalleData.Descripcion || null
    };
    
    if (detalleData.colores && Array.isArray(detalleData.colores) && detalleData.colores.length > 0) {
      const coloresProcesados = detalleData.colores.map(color => ({
        ColorId: String(color.ColorId || color.colorId || ''),
        Stock: Number(color.Stock || color.stock || 0),
        Nombre: String(color.Nombre || color.nombre || 'Color'),
        Hex: String(color.Hex || color.hex || '#CCCCCC')
      }));
      dataToSend.colores = coloresProcesados;
    } else {
      dataToSend.colores = [];
    }
    
    const response = await axios.post(`${API_URL}/api/detalle-compras`, dataToSend);
    return response.data;
  } catch (error) {
    console.error("❌ Error en createDetalleCompra:", error);
    throw error;
  }
};

export const updateDetalleCompra = async (id, detalleData) => {
  try {
    const response = await axios.put(`${API_URL}/api/detalle-compras/${id}`, detalleData);
    return response.data;
  } catch (error) {
    console.error("❌ Error en updateDetalleCompra:", error);
    throw error;
  }
};

export const deleteDetalleCompra = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/detalle-compras/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error en deleteDetalleCompra:", error);
    throw error;
  }
};

// ========== PRODUCTOS ==========

export const getAllProductos = async () => {
  try {
    const params = {
      page: "1",
      limit: "1000"
    };
    
    const response = await axios.get(`${API_URL}/producto`, { params });
    
    return response.data?.data || [];
  } catch (error) {
    console.error("❌ Error en getAllProductos:", error);
    return [];
  }
};

export const buscarProductosPorCampo = async (campo, valor, page = 1, limit = 3) => {
  try {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };
    
    if (campo && valor && valor.trim() !== "") {
      params.filtroCampo = campo;
      params.filtroValor = valor.trim();
    }

    console.log("🔍 Buscando productos con params:", params);
    
    const response = await axios.get(`${API_URL}/producto`, { params });
    
    console.log("📦 Respuesta productos:", {
      dataLength: response.data?.data?.length,
      pagination: response.data?.pagination
    });
    
    return {
      data: response.data?.data || [],
      totalItems: response.data?.pagination?.totalItems || 0,
      totalPages: response.data?.pagination?.totalPages || 1,
      currentPage: response.data?.pagination?.currentPage || page,
      itemsPerPage: response.data?.pagination?.itemsPerPage || limit
    };
  } catch (error) {
    console.error("❌ Error en buscarProductosPorCampo:", error);
    return { 
      data: [], 
      totalItems: 0, 
      totalPages: 1, 
      currentPage: page, 
      itemsPerPage: limit 
    };
  }
};

// ========== PROVEEDORES ==========

export const getAllProveedoresSimple = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/proveedores/todos`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Error al cargar proveedores:", error);
    return [];
  }
};

export const getProveedorById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/proveedores/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener proveedor:", error);
    return null;
  }
};

// ========== COLORES ==========

export const getAllColores = async () => {
  try {
    const response = await axios.get(`${API_URL}/colores`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Error al cargar colores:", error);
    return [];
  }
};

export const getColorById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/colores/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener color:", error);
    return null;
  }
};