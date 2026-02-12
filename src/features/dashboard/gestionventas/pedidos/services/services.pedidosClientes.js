import axios from "axios";

const API_BASE = 'http://localhost:3000';

/**
 * Obtiene todos los pedidos de clientes con sus detalles
 */
export const getAllPedidosClientes = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/pedidos-clientes`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    throw error;
  }
};

/**
 * Obtiene un pedido por ID
 */
export const getPedidoById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/api/pedidos-clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    throw error;
  }
};

/**
 * Crea un nuevo pedido - FUNCIÓN SIMPLIFICADA
 */
export const createPedidoCliente = async (pedidoData) => {
  try {
    console.log('📤 Enviando pedido al backend...');
    console.log('📦 Datos estructurados:', JSON.stringify(pedidoData, null, 2));
    
    const response = await axios.post(`${API_BASE}/api/pedidos-clientes`, pedidoData);
    
    console.log('✅ Respuesta del backend:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error completo:', error);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
      
      if (error.response.data?.error) {
        console.error('💡 Error del backend:', error.response.data.error);
        if (error.response.data?.details) {
          console.error('📝 Detalles:', error.response.data.details);
        }
      }
    }
    
    throw error;
  }
};

/**
 * Actualiza un pedido existente
 */
export const updatePedidoCliente = async (id, pedidoData) => {
  try {
    const response = await axios.put(`${API_BASE}/api/pedidos-clientes/${id}`, pedidoData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    throw error;
  }
};

/**
 * Elimina un pedido
 */
export const deletePedidoCliente = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE}/api/pedidos-clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    throw error;
  }
};

/**
 * Obtiene los detalles de un pedido por su ID
 */
export const getDetallesByPedidoId = async (pedidoId) => {
  try {
    console.log(`🔍 [FRONT-SERVICE] GET detalles para: ${pedidoId}`);
    
    const response = await axios.get(`${API_BASE}/api/detalle-pedido/${pedidoId}`);
    
    console.log(`📬 [FRONT-SERVICE] Respuesta COMPLETA:`, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
    });
    
    // 🔴 DEPURACIÓN DETALLADA del primer detalle
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('📋 [FRONT-SERVICE] Primer detalle analizado:');
      const primerDetalle = response.data[0];
      console.log('   - Keys:', Object.keys(primerDetalle));
      console.log('   - Valores:', {
        DetallePedidoClienteId: primerDetalle.DetallePedidoClienteId,
        ProductoId: primerDetalle.ProductoId,
        ColorId: primerDetalle.ColorId,
        Cantidad: primerDetalle.Cantidad,
        Precio: primerDetalle.Precio,
        Descripcion: primerDetalle.Descripcion,
        UrlImagen: primerDetalle.UrlImagen
      });
      
      // 🔴 VERIFICAR TIPOS DE DATOS
      console.log('   - Tipos:', {
        DetallePedidoClienteId: typeof primerDetalle.DetallePedidoClienteId,
        ProductoId: typeof primerDetalle.ProductoId,
        ColorId: typeof primerDetalle.ColorId,
        Cantidad: typeof primerDetalle.Cantidad,
        Precio: typeof primerDetalle.Precio
      });
    }
    
    // 🔴 RETORNAR SIEMPRE UN ARRAY
    if (!response.data) {
      console.warn(`⚠️ [FRONT-SERVICE] Respuesta vacía`);
      return [];
    }
    
    if (Array.isArray(response.data)) {
      console.log(`✅ [FRONT-SERVICE] Retornando ${response.data.length} detalles`);
      return response.data;
    }
    
    // Si es un objeto, convertirlo a array
    if (typeof response.data === 'object' && response.data !== null) {
      console.log(`🔄 [FRONT-SERVICE] Convirtiendo objeto a array`);
      return [response.data];
    }
    
    console.warn(`⚠️ [FRONT-SERVICE] Tipo de dato inesperado: ${typeof response.data}`);
    return [];
    
  } catch (error) {
    console.error(`❌ [FRONT-SERVICE] Error crítico:`, error);
    
    if (error.response) {
      console.error(`📊 Status: ${error.response.status}`);
      console.error(`📋 Data:`, error.response.data);
      console.error(`🔗 URL: ${error.config?.url}`);
      console.error(`📝 Método: ${error.config?.method}`);
    }
    
    return [];
  }
};
/**
 * Obtiene productos
 */
export const getAllProductos = async () => {
  try {
    const response = await axios.get(`${API_BASE}/producto`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};

/**
 * Obtiene servicios
 */
export const getAllServicios = async () => {
  try {
    const response = await axios.get(`${API_BASE}/servicio`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    throw error;
  }
};

/**
 * Obtiene todos los colores
 */
export const getAllColores = async () => {
  try {
    const response = await axios.get(`${API_BASE}/colores`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al obtener colores:", error);
    throw error;
  }
};

/**
 * Subir archivo de voucher - FUNCIÓN NUEVA
 */
export const uploadVoucher = async (file) => {
  try {
    const formData = new FormData();
    formData.append('voucher', file);
    
    const response = await axios.post(`${API_BASE}/api/voucher`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }
    });
    
    return response.data.url;
  } catch (error) {
    console.error("Error al subir archivo:", error);
    throw error;
  }
};