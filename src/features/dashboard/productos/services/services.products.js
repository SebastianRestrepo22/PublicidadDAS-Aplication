import axios from "axios";

const url = `${import.meta.env.VITE_API_URL}/`;

// Cambiar estado del producto
export const cambiarEstadoProducto = async (id, Estado) => {
  try {
    const response = await axios.put(`${url}producto/${id}/estado`, { Estado });
    
    if (response.status === 200) {
      const productoCompleto = await axios.get(`${url}producto/${id}`);
      // Asegúrate de que productoCompleto.data tenga Colores
      console.log('🎨 Producto completo recibido:', productoCompleto.data.Colores);
      return {
        ...response,
        data: productoCompleto.data
      };
    }
    return response;
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    throw error; // Lanzar el error para que lo capture el componente
  }
};

export const GetDataproductos = async (soloActivos = false, page = 1, limit = 10, filtroCampo = null, filtroValor = null, includeColors = false) => {
  try {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };
    
    if (soloActivos) {
      params.estado = 'Activo';
    }
    
    if (filtroCampo && filtroValor) {
      params.filtroCampo = filtroCampo;
      params.filtroValor = filtroValor;
    }
    
    // 🔥 NUEVO: Incluir colores si se solicita
    if (includeColors) {
      params.includeColors = 'true';
    }
    
    const response = await axios.get(`${url}producto`, { params });
    
    const responseData = response.data;
    const data = responseData?.data && Array.isArray(responseData.data) ? responseData.data : [];
    const pagination = responseData?.pagination || { 
      totalItems: 0, 
      totalPages: 1, 
      currentPage: page, 
      itemsPerPage: limit 
    };
    
    return {
      data: data,
      pagination: pagination
    };
  } catch (error) {
    console.error("Error en GetDataproductos:", error);
    return { 
      data: [], 
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } 
    };
  }
};

// Crear producto - NO elimines Stock
export const postDataproductos = async (data) => {
  console.log('=== SERVICES POST - DATOS A ENVIAR ===');
  console.log('Datos completos:', JSON.stringify(data, null, 2));
  console.log('Stock:', data.Stock, 'Tipo:', typeof data.Stock);
  console.log('=====================================');
  
  try {
    const response = await axios.post(url + 'producto', data);
    return response;
  } catch (error) {
    console.error('Error en postDataproductos:', error.response?.data);
    return { status: false, message: "No esta la api : ", error };
  }
};

// Actualizar un registro - NO elimines Stock
export const updateDataproductos = async (id, data) => {
  console.log('========================================');
  console.log('📡 SERVICIO - updateDataproductos:');
  console.log('ID:', id);
  console.log('Data recibida:', data);
  console.log('UsaColores:', data.UsaColores, 'Tipo:', typeof data.UsaColores);
  console.log('Stock:', data.Stock, 'Tipo:', typeof data.Stock);
  console.log('========================================');
  
  try {
    const response = await axios.put(url + `producto/${id}`, data);
    console.log('📡 Respuesta del backend:', response.status);
    console.log('Data:', response.data);
    console.log('========================================');
    return response;
  } catch (error) {
    console.error('Error en updateDataproductos:', error.response?.data);
    return { status: false, message: "No se puede actualizar el producto : ", error };
  }
};

// Eliminar un registro
export const deleteDataproducto = async (id) => {
  try {
    const response = await axios.delete(url + `producto/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Buscar productos
export const buscarProductos = async (campo, valor, page = 1, limit = 10, estado = null, includeColors = false) => {
  try {
    const params = {
      campo,
      valor,
      page: page.toString(),
      limit: limit.toString()
    };
    
    if (estado) params.estado = estado;
    
    // 🔥 NUEVO: Incluir colores si se solicita
    if (includeColors) {
      params.includeColors = 'true';
    }
    
    const response = await axios.get(`${url}producto/buscar`, { params });
    
    const responseData = response.data;
    const data = responseData && responseData.data && Array.isArray(responseData.data) ? responseData.data : [];
    const pagination = responseData && responseData.pagination ? responseData.pagination : { 
      totalItems: 0, 
      totalPages: 1, 
      currentPage: page, 
      itemsPerPage: limit 
    };
    
    return {
      data: data,
      pagination: pagination
    };
  } catch (error) {
    console.error("Error al buscar productos:", error);
    return { 
      data: [], 
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } 
    };
  }
};

export const updateColoresProducto = async (productoId, coloresConStock) => {
  console.log('Enviando colores para producto:', productoId);
  console.log('Datos a enviar:', coloresConStock);
  
  const coloresParaEnviar = coloresConStock.map(c => {
    return {
      ColorId: String(c.ColorId),
      Stock: c.Stock || 0
    };
  });
  
  console.log('Formato enviado:', coloresParaEnviar);
  
  try {
    const response = await axios.post(
      `${url}producto/${productoId}/colores`,
      { colores: coloresParaEnviar }
    );
    return response.data;
  } catch (error) {
    console.error('Error en updateColoresProducto:', error.response?.data || error.message);
    throw error;
  }
};

export const getColores = async () => {
  const res = await axios.get(`${url}colores`);
  return res.data;
};

export const getColoresProducto = async (productoId) => {
  const res = await axios.get(`${url}producto/${productoId}/colores`);
  return res.data;
};

export const getProductoByIdService = async (id) => {
  try {
    console.log("🔍 Buscando producto por ID:", id);
    const res = await axios.get(`${url}producto/${id}`);
    console.log("✅ Producto encontrado:", res.data);
    
    console.log("🎨 Colores del producto:", res.data.Colores);
    
    return res.data;
  } catch (error) {
    console.error("❌ Error en getProductoByIdService:", error);
    return null;
  }
};

// Función para obtener colores de un producto específico
export const getColoresByProductoId = async (productoId) => {
  try {
    const response = await fetch(`${url}producto/${productoId}/colores`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error cargando colores para producto ${productoId}:`, error);
    return [];
  }
};