import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const GetDataservicios = async (soloActivos = false, page = 1, limit = 10, filtroCampo = null, filtroValor = null) => {
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
    
    const response = await axios.get(`${API_URL}/servicio`, { params });
    
    const responseData = response.data;
    const data = responseData?.data && Array.isArray(responseData.data) ? responseData.data : [];
    const pagination = responseData?.pagination || { 
      totalItems: 0, 
      totalPages: 1, 
      currentPage: page, 
      itemsPerPage: limit 
    };
    
    return { data, pagination };
  } catch (error) {
    console.error("Error en GetDataservicios:", error);
    return { 
      data: [], 
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } 
    };
  }
};

export const postDataservicios = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/servicio`, data);
    return response;
  } catch (error) {
    console.error("Error en postDataservicios:", error);
    return { status: false, message: "Error al crear servicio", error };
  }
};

export const updateDataservicios = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/servicio/${id}`, data);
    return response;
  } catch (error) {
    console.error("Error en updateDataservicios:", error);
    return { status: false, message: "Error al actualizar servicio", error };
  }
};

export const deleteDataservicio = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/servicio/${id}`);
    return response;  // Retornar response completo, no solo data
  } catch (error) {
    console.error("Error en deleteDataservicio:", error);
    return error.response || { status: 500, message: "Error de conexión" };
  }
};

export const cambiarEstadoServicio = async (id, nuevoEstado) => {
  try {
    const response = await axios.patch(`${API_URL}/servicio/${id}/estado`, { Estado: nuevoEstado });
    return response;
  } catch (error) {
    console.error("Error en cambiarEstadoServicio:", error);
    return { status: false, message: "Error al cambiar estado", error };
  }
};

export const buscarservicios = async (campo, valor, page = 1, limit = 10, estado = null) => {
  try {
    const params = {
      campo,
      valor,
      page: page.toString(),
      limit: limit.toString()
    };
    
    if (estado) params.estado = estado;
    
    const response = await axios.get(`${API_URL}/servicio/buscar`, { params });
    
    const responseData = response.data;
    const data = responseData?.data && Array.isArray(responseData.data) ? responseData.data : [];
    const pagination = responseData?.pagination || { 
      totalItems: 0, 
      totalPages: 1, 
      currentPage: page, 
      itemsPerPage: limit 
    };
    
    return { data, pagination };
  } catch (error) {
    console.error("Error al buscar servicios:", error);
    return { 
      data: [], 
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } 
    };
  }
};