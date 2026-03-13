import axios from "axios";

const API_URL = 'http://localhost:3000';



// ========== FUNCIONES CON PAGINACIÓN ==========

export const getComprasPaginated = async (page = 1, limit = 5, filtroCampo = null, filtroValor = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filtroCampo && filtroValor && { filtroCampo, filtroValor })
    });
    
    console.log("📤 getComprasPaginated - Enviando petición:", {
      url: `${API_URL}/api/compras?${params}`,
      page,
      limit,
      filtroCampo,
      filtroValor
    });

    const response = await axios.get(`${API_URL}/api/compras?${params}`);
    
    console.log("📥 getComprasPaginated - Respuesta del backend:", response.data);
    console.log("📥 getComprasPaginated - Estructura:", {
      tieneData: !!response.data?.data,
      esArray: Array.isArray(response.data),
      dataLength: response.data?.data?.length || response.data?.length
    });

    // 🔥 IMPORTANTE: El backend YA devuelve { data, pagination }
    // Solo debemos devolverlo tal cual
    return response.data;
    
  } catch (error) {
    console.error("❌ Error en getComprasPaginated:", error);
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

export const buscarCompras = async (campo, valor, page = 1, limit = 5) => {
  try {
    const params = new URLSearchParams({
      campo,
      valor,
      page: page.toString(),
      limit: limit.toString()
    });
    
    console.log("📤 buscarCompras - Enviando petición:", {
      url: `${API_URL}/api/compras/buscar?${params}`,
      campo,
      valor,
      page,
      limit
    });

    const response = await axios.get(`${API_URL}/api/compras/buscar?${params}`);
    
    console.log("📥 buscarCompras - Respuesta del backend:", response.data);
    
    // El backend YA devuelve { data, pagination }
    return response.data;
    
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

// ========== FUNCIONES PARA COMPATIBILIDAD ==========

export const getAllCompras = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/compras/todas`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error en getAllCompras:", error);
    return [];
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

export const updateCompraEstado = async (id, nuevoEstado, options = {}) => {
  try {
    const response = await axios.patch(`${'http://localhost:3000'}/api/compras/${id}/estado`, {
      estado: nuevoEstado,
      productos: options.productos,
      motivoCancelacion: options.motivoCancelacion
    });
    return response.data;
  } catch (error) {
    console.error("Error en updateCompraEstado:", error);
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

export const getDetallesByCompraId = async (compraId) => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/detalle-compras/compra/${compraId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error en getDetallesByCompraId:", error);
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
    
    const response = await axios.post(`${'http://localhost:3000'}/api/detalle-compras`, dataToSend);
    return response.data;
  } catch (error) {
    console.error("Error en createDetalleCompra:", error);
    throw error;
  }
};

// ========== PRODUCTOS - Usando la estructura correcta ==========

export const getAllProductos = async () => {
  try {
    const params = {
      page: "1",
      limit: "1000"  // Límite alto para obtener todos
    };
    
    const response = await axios.get(`${'http://localhost:3000'}/producto`, { params });
    
    // La respuesta tiene estructura { data: [...], pagination: {...} }
    return response.data?.data || [];
  } catch (error) {
    console.error("Error en getAllProductos:", error);
    return [];
  }
};

export const buscarProductosPorCampo = async (campo, valor, page = 1, limit = 5) => {
  try {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };
    
    if (campo && valor && valor.trim() !== "") {
      params.filtroCampo = campo;
      params.filtroValor = valor.trim();
    }

    const response = await axios.get(`${'http://localhost:3000'}/producto`, { params });
    
    return {
      data: response.data?.data || [],
      total: response.data?.pagination?.totalItems || 0,
      pages: response.data?.pagination?.totalPages || 1
    };
  } catch (error) {
    console.error("Error en buscarProductosPorCampo:", error);
    return { data: [], total: 0, pages: 1 };
  }
};

// ========== PROVEEDORES ==========

export const getAllProveedoresSimple = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/proveedores/todos`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al cargar proveedores:", error);
    return [];
  }
};

// ========== COLORES ==========

export const getAllColores = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/colores`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al cargar colores:", error);
    return [];
  }
};