import axios from "axios";

const url = 'http://localhost:3000/api/';

// ========== FUNCIÓN PARA COMPATIBILIDAD CON MÓDULO DE PRODUCTOS ==========
// ¡NO ELIMINAR! Esta función la usa el módulo de productos de mi compañero
export const getAllCategorias = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api/'}categorias/todas`);
    return response; // Devuelve la respuesta completa como espera el componente productos
  } catch (error) {
    console.error("Error al obtener todas las categorías:", error);
    return { data: [], status: false };
  }
};

// ========== TUS FUNCIONES CON PAGINACIÓN ==========

// Obtener categorías con paginación (para tu módulo de categorías)
export const getCategoriasPaginated = async (page = 1, limit = 10, filtroCampo = null, filtroValor = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filtroCampo && filtroValor && { filtroCampo, filtroValor })
    });
    
    const response = await axios.get(`${'http://localhost:3000/api/'}categorias?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener categorías paginadas:", error);
    return { data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } };
  }
};

// Buscar categorías con paginación
export const buscarCategorias = async (campo, valor, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      campo,
      valor,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await axios.get(`${'http://localhost:3000/api/'}categorias/buscar?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error al buscar categorías:", error);
    return { data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: limit } };
  }
};

// ========== FUNCIONES CRUD ==========

// Obtener una categoría por ID
export const getCategoriaById = async (id) => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api/'}categorias/${id}`);
    return response;
  } catch (error) {
    return { status: false, message: "No se puede obtener la categoría", error };
  }
};

// Crear una nueva categoría
export const createCategoria = async (data) => {
  try {
    const response = await axios.post('http://localhost:3000/api/' + "categorias", data);
    return response;
  } catch (error) {
    return { status: false, message: "No se puede crear la categoría", error };
  }
};

// Actualizar categoría
export const updateCategoria = async (id, data) => {
  try {
    const response = await axios.put(`${'http://localhost:3000/api/'}categorias/${id}`, data);
    return response;
  } catch (error) {
    return { status: false, message: "No se puede actualizar la categoría", error };
  }
};

// Eliminar categoría
export const deleteCategoria = async (id) => {
  try {
    const response = await axios.delete(`${'http://localhost:3000/api/'}categorias/${id}`);
    return response;
  } catch (error) {
    return { status: false, message: "No se puede eliminar la categoría", error };
  }
};