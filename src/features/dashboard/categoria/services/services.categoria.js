import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; // 🔥 Usar variable de entorno

export const getAllCategorias = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/categorias/todas`);
    return response.data;
  } catch (error) {
    console.error("Error en getAllCategorias:", error);
    return [];
  }
};

export const getCategoriasPaginated = async (page = 1, limit = 10, filtroCampo = null, filtroValor = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filtroCampo && filtroValor && { filtroCampo, filtroValor })
    });
    
    const response = await axios.get(`${API_URL}/api/categorias?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener categorías paginadas:", error);
    return { data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } };
  }
};

export const buscarCategorias = async (campo, valor, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      campo,
      valor,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await axios.get(`${API_URL}/api/categorias/buscar?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error al buscar categorías:", error);
    return { data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } };
  }
};

export const getCategoriaById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/categorias/${id}`);
    return response;
  } catch (error) {
    return { status: false, message: "No se puede obtener la categoría", error };
  }
};

export const createCategoria = async (data) => {
  const response = await axios.post(`${API_URL}/api/categorias`, data);
  return response;
};

export const updateCategoria = async (id, data) => {
  const response = await axios.put(`${API_URL}/api/categorias/${id}`, data);
  return response;
};

export const deleteCategoria = async (id) => {
  const response = await axios.delete(`${API_URL}/api/categorias/${id}`);
  return response;
};