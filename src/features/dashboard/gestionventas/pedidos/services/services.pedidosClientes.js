import axios from "axios";

const API_BASE = 'http://localhost:3000';

/**
 * Obtiene todos los pedidos de clientes con paginación
 */
export const getAllPedidosClientes = async (page = 1, limit = 10, filtroCampo = '', filtroValor = '', tipoPago = '') => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    if (filtroCampo && filtroValor) {
      params.append('filtroCampo', filtroCampo);
      params.append('filtroValor', filtroValor);
    }
    
    if (tipoPago) {
      params.append('tipoPago', tipoPago);
    }
    
    const response = await axios.get(`${API_BASE}/api/pedidos-clientes?${params.toString()}`);
    
    // La respuesta ahora tiene estructura { data, pagination }
    return {
      data: Array.isArray(response.data.data) ? response.data.data : [],
      pagination: response.data.pagination || {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    throw error;
  }
};

/**
 * Buscar pedidos con paginación
 */
export const buscarPedidos = async (campo, valor, page = 1, limit = 10, tipoPago = '') => {
  try {
    const params = new URLSearchParams();
    params.append('campo', campo);
    params.append('valor', valor);
    params.append('page', page);
    params.append('limit', limit);
    
    if (tipoPago) {
      params.append('tipoPago', tipoPago);
    }
    
    const response = await axios.get(`${API_BASE}/api/pedidos-clientes/buscar?${params.toString()}`);
    
    return {
      data: Array.isArray(response.data.data) ? response.data.data : [],
      pagination: response.data.pagination || {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    console.error("Error al buscar pedidos:", error);
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
 * Crea un nuevo pedido - Versión simplificada (sin tamaño ni archivos para servicios)
 */
export const createPedidoCliente = async (pedidoData) => {
  try {
    console.log('📤 Enviando pedido al backend...');
    console.log('📦 Datos estructurados:', JSON.stringify(pedidoData, null, 2));
    
    const response = await axios.post(`${API_BASE}/api/pedidos-clientes`, pedidoData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }
    });
    
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
    // Determinar si es FormData o JSON
    const isFormData = pedidoData instanceof FormData;
    
    const response = await axios.put(`${API_BASE}/api/pedidos-clientes/${id}`, pedidoData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    throw error;
  }
};

/**
 * Cambiar estado de un pedido
 */
export const cambiarEstadoPedido = async (id, estado, motivo = '') => {
  try {
    const payload = { Estado: estado };
    if (estado === 'cancelado' && motivo) {
      payload.motivo = motivo;
    }
    
    const response = await axios.put(`${API_BASE}/api/pedidos-clientes/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error al cambiar estado:", error);
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
 * Obtiene los detalles de un pedido por su ID (VERSIÓN SIMPLIFICADA)
 */
export const getDetallesByPedidoId = async (pedidoId) => {
  try {
    console.log(`🔍 [FRONT-SERVICE] GET detalles para: ${pedidoId}`);
    
    const response = await axios.get(`${API_BASE}/api/detalle-pedido/${pedidoId}`);
    
    console.log(`📬 [FRONT-SERVICE] Respuesta:`, {
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
    });
    
    if (!response.data) {
      return [];
    }
    
    if (Array.isArray(response.data)) {
      // 🔴 ELIMINADO: Ya no procesamos UrlImagenPersonalizada ni Tamaño
      return response.data;
    }
    
    if (typeof response.data === 'object' && response.data !== null) {
      return [response.data];
    }
    
    return [];
    
  } catch (error) {
    console.error(`❌ [FRONT-SERVICE] Error:`, error);
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
 * Subir archivo de voucher
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

/**
 * Obtiene todos los clientes
 */
export const getAllClientes = async () => {
  try {
    const response = await axios.get(`${API_BASE}/client`);
    return response.data;
  } catch (error) {
    console.error('Error fetching clientes:', error);
    return [];
  }
};

/**
 * Obtener pedidos por método de pago (utilidad)
 */
export const getPedidosByMetodoPago = async (metodoPago, page = 1, limit = 10) => {
  return getAllPedidosClientes(page, limit, 'MetodoPago', metodoPago);
};

/**
 * Obtener pedidos pendientes de contra entrega
 */
export const getPedidosContraEntregaPendientes = async (page = 1, limit = 10) => {
  return getAllPedidosClientes(page, limit, 'Estado', 'pendiente', 'contra_entrega');
};

/**
 * Obtener pedidos de transferencia aprobados
 */
export const getPedidosTransferenciaAprobados = async (page = 1, limit = 10) => {
  return getAllPedidosClientes(page, limit, 'Estado', 'aprobado', 'transferencia');
};