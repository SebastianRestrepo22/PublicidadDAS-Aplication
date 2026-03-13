import axios from "axios";

const url = 'http://localhost:3000/client';

// Listar todos los clientes
export const getDataClients = async (page = 1, limit = 10, filtroCampo = null, filtroValor = null) => {
  try {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };
    
    if (filtroCampo && filtroValor) {
      params.filtroCampo = filtroCampo;
      params.filtroValor = filtroValor;
    }
    
    const response = await axios.get(url, { params });
    
    const responseData = response.data;
    const data = responseData && responseData.data && Array.isArray(responseData.data) ? responseData.data : [];
    const pagination = responseData && responseData.pagination ? responseData.pagination : { 
      totalItems: 0, 
      totalPages: 1, 
      currentPage: page, 
      itemsPerPage: limit 
    };
    
    // RETORNO CORRECTO
    return {
      data: data,
      pagination: pagination
    };
  } catch (error) {
    console.error("Error en getDataClients:", error);
    // Fallback CORRECTO
    return { 
      data: [], 
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } 
    };
  }
};

// Crear cliente
export const postDataClients = async (data) => {
    try {
        const response = await axios.post(url, data);
        return response;
    } catch (error) {
        return { status: false, message: "No esta la api : ", error };
    }
};

// Obtener cliente por ID
export const getClientById = async (id) => {
    try {
        const response = await axios.get(`${url}/${id}`);
        return response;
    } catch (error) {
        return { status: false, message: "No se pudo obtener el cliente : ", error };
    }
};

// Actualizar cliente
export const updateDataClient = async (id, data) => {
    try {
        const response = await axios.put(`${url}/${id}`, data);
        return response;
    } catch (error) {
        return { status: false, message: "No se puede actualizar el cliente : ", error };
    }
};

// Eliminar cliente
export const deleteDataClient = async (id) => {
    try {
        const response = await axios.delete(`${url}/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const buscarClientes = async (campo, valor, page = 1, limit = 10) => {
  try {
    const params = {
      campo: campo,
      valor: valor,
      page: page.toString(),
      limit: limit.toString()
    };
    
    const response = await axios.get(`${url}/buscar`, { params });
    
    const responseData = response.data;
    const data = responseData && responseData.data && Array.isArray(responseData.data) ? responseData.data : [];
    const pagination = responseData && responseData.pagination ? responseData.pagination : { 
      totalItems: 0, 
      totalPages: 1, 
      currentPage: page, 
      itemsPerPage: limit 
    };
    
    // RETORNO CORRECTO
    return {
      data: data,
      pagination: pagination
    };
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    // Fallback CORRECTO
    return { 
      data: [], 
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } 
    };
  }
};