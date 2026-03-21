import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL; // <- URL base desde .env

// Listar todos los datos
export const GetDataUser = async (page = 1, limit = 10, filtroCampo = null, filtroValor = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (filtroCampo && filtroValor) {
      params.append('filtroCampo', filtroCampo);
      params.append('filtroValor', filtroValor);
    }
    
    const response = await axios.get(`${API_URL}/user?${params}`);
    
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
    console.error("Error en GetDataUser:", error);
    return { 
      data: [], 
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } 
    };
  }
};

// Listar los datos de un registro
export const postDataUsers = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/user`, data);
    return response;
  } catch (error) {
    return error.response || { 
      status: 500, 
      data: { message: error.message || "Error de conexión" } 
    };
  }
};

// Actualizar un registro
export const updateDatauser = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/user/${id}`, data);
    return response;
  } catch (error) {
    return { status: false, message: "No se puede actualizar el usuario : ", error };
  }
};

// Eliminar un registro
export const deleteDataUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/user/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Buscar usuarios
export const buscarUsuarios = async (campo, valor, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      campo,
      valor,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await axios.get(`${API_URL}/user/buscar?${params}`);
    
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
    console.error("Error al buscar usuarios:", error);
    return { 
      data: [], 
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } 
    };
  }
};