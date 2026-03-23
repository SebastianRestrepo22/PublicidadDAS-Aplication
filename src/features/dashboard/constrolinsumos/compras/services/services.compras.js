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
    console.log("🎨 getDetallesByCompraId - Respuesta:", {
      compraId,
      cantidad: response.data?.length,
      primerDetalle: response.data?.[0]?.colores
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Error en getDetallesByCompraId:", error);
    return [];
  }
};

export const createDetalleCompra = async (detalleData) => {
  try {
    console.log("🎨 [SERVICE] Creando detalle con datos:", detalleData);
    
    const dataToSend = {
      CompraId: detalleData.CompraId,
      ProductoId: detalleData.ProductoId,
      Cantidad: Number(detalleData.Cantidad) || 0,
      PrecioUnitario: Number(detalleData.PrecioUnitario) || 0,
      Descripcion: detalleData.Descripcion || null,
      colores: [] // Por defecto array vacío
    };
    
    // 🔥 PROCESAR COLORES CON SU STOCK CORRECTAMENTE
    if (detalleData.colores && Array.isArray(detalleData.colores) && detalleData.colores.length > 0) {
      console.log("🎨 [SERVICE] Procesando colores con stock:", detalleData.colores);
      
      const coloresProcesados = detalleData.colores.map(color => {
        // Asegurar que cada color tenga Stock (puede venir como Stock, stock o cantidad)
        let stock = 0;
        if (color.Stock !== undefined) stock = Number(color.Stock);
        else if (color.stock !== undefined) stock = Number(color.stock);
        else if (color.cantidad !== undefined) stock = Number(color.cantidad);
        else stock = Number(color.Stock || 0);
        
        if (isNaN(stock)) stock = 0;
        
        return {
          ColorId: String(color.ColorId || color.colorId || ''),
          Stock: stock, // 🔥 ESTE ES EL STOCK QUE SE GUARDARÁ
          Nombre: String(color.Nombre || color.nombre || 'Color'),
          Hex: String(color.Hex || color.hex || '#CCCCCC')
        };
      });
      
      // Filtrar colores con stock > 0
      const coloresConStock = coloresProcesados.filter(color => color.Stock > 0);
      
      if (coloresConStock.length > 0) {
        dataToSend.colores = coloresConStock;
        console.log("✅ [SERVICE] Colores a enviar al backend:", JSON.stringify(dataToSend.colores, null, 2));
      } else {
        console.warn("⚠️ [SERVICE] No hay colores con stock > 0, enviando array vacío");
        dataToSend.colores = [];
      }
    } else {
      console.log("📦 [SERVICE] Sin colores, enviando array vacío");
    }
    
    console.log("📤 [SERVICE] Enviando detalle al backend:", {
      CompraId: dataToSend.CompraId,
      ProductoId: dataToSend.ProductoId,
      Cantidad: dataToSend.Cantidad,
      PrecioUnitario: dataToSend.PrecioUnitario,
      coloresCount: dataToSend.colores.length,
      colores: dataToSend.colores
    });
    
    const response = await axios.post(`${API_URL}/api/detalle-compras`, dataToSend);
    console.log("✅ [SERVICE] Respuesta del backend:", response.data);
    const response = await axios.post(`${API_URL}/api/detalle-compras`, dataToSend);
    return response.data;
    
  } catch (error) {
    console.error("❌ [SERVICE] Error en createDetalleCompra:", error);
    if (error.response) {
      console.error("📦 [SERVICE] Error response:", error.response.data);
      console.error("📦 [SERVICE] Status:", error.response.status);
    }
    throw error;
  }
};

export const updateDetalleCompra = async (id, detalleData) => {
  try {
    console.log("🎨 [SERVICE] Actualizando detalle:", id, detalleData);
    
    const dataToSend = {
      ProductoId: detalleData.ProductoId,
      Cantidad: Number(detalleData.Cantidad) || 0,
      PrecioUnitario: Number(detalleData.PrecioUnitario) || 0,
      Descripcion: detalleData.Descripcion || null,
      colores: []
    };
    
    // 🔥 PROCESAR COLORES CON STOCK PARA ACTUALIZACIÓN
    if (detalleData.colores && Array.isArray(detalleData.colores) && detalleData.colores.length > 0) {
      console.log("🎨 [SERVICE] Procesando colores para actualización:", detalleData.colores);
      
      const coloresProcesados = detalleData.colores.map(color => {
        let stock = 0;
        if (color.Stock !== undefined) stock = Number(color.Stock);
        else if (color.stock !== undefined) stock = Number(color.stock);
        else if (color.cantidad !== undefined) stock = Number(color.cantidad);
        else stock = Number(color.Stock || 0);
        
        if (isNaN(stock)) stock = 0;
        
        return {
          ColorId: String(color.ColorId || color.colorId || ''),
          Stock: stock,
          Nombre: String(color.Nombre || color.nombre || 'Color'),
          Hex: String(color.Hex || color.hex || '#CCCCCC')
        };
      });
      
      const coloresConStock = coloresProcesados.filter(color => color.Stock > 0);
      dataToSend.colores = coloresConStock;
      console.log("✅ [SERVICE] Colores actualizados:", dataToSend.colores);
    }
    
    const response = await axios.put(`${API_URL}/api/detalle-compras/${id}`, dataToSend);
    console.log("✅ [SERVICE] Detalle actualizado correctamente");
    const response = await axios.put(`${API_URL}/api/detalle-compras/${id}`, detalleData);
    return response.data;
    
  } catch (error) {
    console.error("❌ [SERVICE] Error en updateDetalleCompra:", error);
    if (error.response) {
      console.error("📦 [SERVICE] Error response:", error.response.data);
    }
    throw error;
  }
};

export const deleteDetalleCompra = async (id) => {
  try {
    console.log("🗑️ [SERVICE] Eliminando detalle:", id);
    const response = await axios.delete(`${API_URL}/api/detalle-compras/${id}`);
    console.log("✅ [SERVICE] Detalle eliminado correctamente");
    const response = await axios.delete(`${API_URL}/api/detalle-compras/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ [SERVICE] Error en deleteDetalleCompra:", error);
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

// ========== FUNCIÓN DE UTILIDAD PARA PROCESAR COLORES ==========

export const procesarColoresConStock = (coloresSeleccionados, coloresDisponibles, cantidadesPorColor = {}) => {
  if (!coloresSeleccionados || coloresSeleccionados.length === 0) {
    return [];
  }
  
  return coloresSeleccionados.map(colorId => {
    const colorInfo = coloresDisponibles.find(c => c.ColorId === colorId || c.id === colorId);
    const cantidad = cantidadesPorColor[colorId] || 1;
    
    return {
      ColorId: colorId,
      Stock: cantidad, // 🔥 Aquí va la cantidad de ese color en la compra
      Nombre: colorInfo?.Nombre || colorInfo?.nombre || 'Color',
      Hex: colorInfo?.Hex || colorInfo?.hex || '#CCCCCC'
    };
  });
};