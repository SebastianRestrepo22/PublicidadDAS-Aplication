import axios from "axios";

const API_URL = "http://localhost:3000/api";

export const createVentaManual = async (ventaData) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    let config = { headers };
    
    // Si es FormData, NO establecer Content-Type (axios lo hará automáticamente con el boundary)
    if (ventaData instanceof FormData) {
      console.log("📤 Enviando FormData con archivos...");
      // No establecer Content-Type
    } else {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await axios.post(`${API_URL}/ventas/manual`, ventaData, config);
    return response.data;
    
  } catch (error) {
    console.error("❌ Error en createVentaManual:", error.response?.data || error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getVentas = async (page = 1, limit = 10, filtroCampo = null, filtroValor = null, fechaInicio = null, fechaFin = null) => {
  try {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };
    
    if (filtroCampo && filtroValor) {
      params.filtroCampo = filtroCampo;
      params.filtroValor = filtroValor;
    }
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    
    const response = await axios.get(`${API_URL}/ventas`, { 
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const responseData = response.data;
    const data = responseData && responseData.data && Array.isArray(responseData.data) ? responseData.data : [];
    const pagination = responseData && responseData.pagination ? responseData.pagination : { 
      totalItems: 0, 
      totalPages: 1, 
      currentPage: page, 
      itemsPerPage: limit 
    };
    
    // ✅ RETORNO CORRECTO
    return {
      data: data,
      pagination: pagination
    };
  } catch (error) {
    console.error("Error en getVentas:", error);
    // ✅ Fallback CORRECTO
    return { 
      data: [], 
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } 
    };
  }
};

export const getVentaById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/ventas/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error en getVentaById:", error);
    throw error;
  }
};

export const anularVenta = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/ventas/${id}/anular`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error en anularVenta:", error);
    throw error;
  }
};