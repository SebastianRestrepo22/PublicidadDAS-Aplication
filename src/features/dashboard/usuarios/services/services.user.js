import axios from "axios"
const url = 'http://localhost:3000/'

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
    
    const response = await axios.get(`${url}user?${params}`);
    
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
    console.error("Error en GetDataUser:", error);
    return { 
      data: [], 
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } 
    };
  }
};

// Listar los datos de un regitro
export const postDataUsers = async (data) => {
  try {
    const response = await axios.post(url + 'user', data);
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
        const response = await axios.put(url + `user/${id}`, data);
        return response; // Devuelve la respuesta de la API
    } catch (error) {
        return { status: false, message: "No se puede actualizar el usuario : ", error }; // Manejo de errores
    }
}

// Eliminar un registro
export const deleteDataUser = async (id) => {
    try {
        const response = await axios.delete(url + `user/${id}`);
        return response; // Devuelve la respuesta de la API
    } catch (error) {
        throw error; // Manejo de errores
    }
}

//Buscar usuarios

export const buscarUsuarios = async (campo, valor, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      campo: campo,
      valor: valor,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await axios.get(`${url}user/buscar?${params}`);
    
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
    console.error("Error al buscar usuarios:", error);
    return { 
      data: [], 
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } 
    };
  }
};