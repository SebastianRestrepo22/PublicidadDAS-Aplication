import axios from "axios";

const API_BASE = 'http://localhost:3000/api';

// === Insumos ===

/**
 * Obtiene todos los insumos
 */
export const getAllInsumos = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api'}/insumos`);
    // Mapear los datos del backend al formato del frontend si es necesario
    const insumos = Array.isArray(response.data) ? response.data : [];
    return insumos.map(insumo => ({
      ...insumo,
      // Asegurar que tengamos ambos formatos para compatibilidad
      Nombre: insumo.nombreInsumo || insumo.Nombre || '',
      Stock: insumo.stock || insumo.Stock || 0,
      nombreInsumo: insumo.nombreInsumo || insumo.Nombre || '',
      stock: insumo.stock || insumo.Stock || 0,
      InsumoId: insumo.InsumoId || insumo.id || insumo.ID || 0
    }));
  } catch (error) {
    console.error("Error al obtener insumos:", error);
    throw error;
  }
};

/**
 * Obtiene un insumo por ID
 */
export const getInsumoById = async (id) => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api'}/insumos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener insumo con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo insumo
 * @param {Object} insumoData - Datos del insumo (nombreInsumo, stock)
 * @returns {Object} El insumo creado
 */
export const createInsumo = async (insumoData) => {
  try {
    // Asegurarse de que los datos estén en el formato que espera el backend
    const dataToSend = {
      nombreInsumo: insumoData.nombreInsumo,
      stock: insumoData.stock
    };
    
    console.log("Enviando datos al backend:", dataToSend);
    
    const response = await axios.post(`${'http://localhost:3000/api'}/insumos`, dataToSend);
    console.log("Respuesta del backend:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error al crear insumo:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }
    throw error;
  }
};

/**
 * Actualiza un insumo existente
 * @param {number} id - ID del insumo
 * @param {Object} insumoData - Datos actualizados (nombreInsumo, stock)
 * @returns {Object} Resultado de la actualización
 */
export const updateInsumo = async (id, insumoData) => {
  try {
    // Asegurarse de que los datos estén en el formato que espera el backend
    const dataToSend = {
      nombreInsumo: insumoData.nombreInsumo,
      stock: insumoData.stock
    };
    
    console.log(`Actualizando insumo ID ${id} con datos:`, dataToSend);
    
    const response = await axios.put(`${'http://localhost:3000/api'}/insumos/${id}`, dataToSend);
    console.log("Respuesta del backend:", response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar insumo con ID ${id}:`, error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }
    throw error;
  }
};

/**
 * Elimina un insumo
 * @param {number} id - ID del insumo
 * @returns {Object} Resultado de la eliminación
 */
export const deleteInsumo = async (id) => {
  try {
    const response = await axios.delete(`${'http://localhost:3000/api'}/insumos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar insumo con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene insumos con paginación y búsqueda
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @param {string} search - Término de búsqueda
 * @returns {Object} { data, total, totalPages }
 */
export const getInsumosPaginados = async (page = 1, limit = 5, search = "") => {
  try {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", limit);
    if (search) params.set("search", search);

    const response = await axios.get(`${'http://localhost:3000/api'}/insumos?${params.toString()}`);
    
    // Si el backend soporta paginación
    if (response.data && Array.isArray(response.data.data)) {
      const insumos = response.data.data.map(insumo => ({
        ...insumo,
        // Asegurar compatibilidad con ambos formatos
        Nombre: insumo.nombreInsumo || insumo.Nombre || '',
        Stock: insumo.stock || insumo.Stock || 0,
        nombreInsumo: insumo.nombreInsumo || insumo.Nombre || '',
        stock: insumo.stock || insumo.Stock || 0,
        InsumoId: insumo.InsumoId || insumo.id || insumo.ID || 0
      }));
      
      return {
        data: insumos,
        total: response.data.total || insumos.length,
        page: response.data.page || page,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || insumos.length) / limit)
      };
    } else if (Array.isArray(response.data)) {
      // Si no hay paginación en el backend, se simula
      const allData = response.data.map(insumo => ({
        ...insumo,
        // Asegurar compatibilidad con ambos formatos
        Nombre: insumo.nombreInsumo || insumo.Nombre || '',
        Stock: insumo.stock || insumo.Stock || 0,
        nombreInsumo: insumo.nombreInsumo || insumo.Nombre || '',
        stock: insumo.stock || insumo.Stock || 0,
        InsumoId: insumo.InsumoId || insumo.id || insumo.ID || 0
      }));
      
      const filtered = search 
        ? allData.filter(i => 
            (i.nombreInsumo || '').toLowerCase().includes(search.toLowerCase()) ||
            (i.Nombre || '').toLowerCase().includes(search.toLowerCase()) ||
            (i.InsumoId || i.id || '').toString().includes(search) ||
            (i.stock || i.Stock || '').toString().includes(search)
          )
        : allData;
      
      const total = filtered.length;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);
      
      return {
        data: paginated,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } else {
      return { data: [], total: 0, page, totalPages: 0 };
    }
  } catch (error) {
    console.error("Error al obtener insumos paginados:", error);
    return { data: [], total: 0, page, totalPages: 0 };
  }
};