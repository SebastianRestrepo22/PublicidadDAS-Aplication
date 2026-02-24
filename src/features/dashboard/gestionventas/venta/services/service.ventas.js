import axios from "axios";

const API_URL = "http://localhost:3000/api";

export const createVentaManual = async (ventaData) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    let config = { headers };
    
    // Si ventaData es FormData, axios automáticamente establece
    // el Content-Type correcto con boundary
    if (ventaData instanceof FormData) {
      console.log("Enviando FormData...");
      // No establecer Content-Type, axios lo hará automáticamente
    } else {
      headers['Content-Type'] = 'application/json';
      console.log("Enviando JSON:", ventaData);
    }
    
    const response = await axios.post(`${API_URL}/ventas/manual`, ventaData, config);
    return response.data;
  } catch (error) {
    console.error("Error en createVentaManual:", error.response?.data || error);
    throw error;
  }
};

export const getVentas = async () => {
  try {
    const response = await axios.get(`${API_URL}/ventas`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error en getVentas:", error);
    throw error;
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