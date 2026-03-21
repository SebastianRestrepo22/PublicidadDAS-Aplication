import axios from "axios";

// URL base desde .env
const API_URL = import.meta.env.VITE_API_URL;

export const createVentaManual = async (ventaData) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    if (!(ventaData instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await axios.post(`${API_URL}/api/ventas/manual`, ventaData, { headers });
    return response.data;
    
  } catch (error) {
    console.error("Error en createVentaManual:", error.response?.data || error);
    if (error.response?.data) throw error.response.data;
    throw error;
  }
};

export const getVentas = async (page = 1, limit = 10, filtroCampo = null, filtroValor = null, fechaInicio = null, fechaFin = null) => {
  try {
    const params = { page: page.toString(), limit: limit.toString() };
    if (filtroCampo && filtroValor) { params.filtroCampo = filtroCampo; params.filtroValor = filtroValor; }
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    
    const response = await axios.get(`${API_URL}/api/ventas`, { 
      params,
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    const data = Array.isArray(response.data?.data) ? response.data.data : [];
    const pagination = response.data?.pagination || { totalItems: 0, totalPages: 1, currentPage: page, itemsPerPage: limit };
    
    return { data, pagination };
  } catch (error) {
    console.error("Error en getVentas:", error);
    return { data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } };
  }
};

export const getVentaById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/ventas/${id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    return response.data;
  } catch (error) {
    console.error("Error en getVentaById:", error);
    throw error;
  }
};

export const anularVenta = async (id, motivo) => {
  try {
    const response = await axios.put(`${API_URL}/api/ventas/${id}/anular`, { motivo: motivo || null }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    return response.data;
  } catch (error) {
    console.error("Error en anularVenta:", error);
    throw error;
  }
};

export const actualizarEstadoVenta = async (id, nuevoEstado, motivo = null) => {
  try {
    const response = await axios.put(`${API_URL}/api/ventas/${id}/estado`, { Estado: nuevoEstado, motivo: motivo || null }, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error("Error en actualizarEstadoVenta:", error);
    throw error.response?.data || error;
  }
};

export const rechazarVenta = async (id, motivo) => {
  try {
    const response = await axios.put(`${API_URL}/api/ventas/${id}/rechazar`, { motivo: motivo || null }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    return response.data;
  } catch (error) {
    console.error("Error en rechazarVenta:", error);
    throw error;
  }
};