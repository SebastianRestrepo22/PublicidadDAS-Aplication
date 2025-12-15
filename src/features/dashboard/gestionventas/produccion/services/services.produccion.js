// src/services/produccionService.js
import axios from "axios";


// === PRODUCCIÓN ===
export const getAllProducciones = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api'}/produccion`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching producciones:", error);
    throw error;
  }
};

export const getProduccionById = async (id) => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api'}/produccion/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching producción ${id}:`, error);
    throw error;
  }
};

// Reemplaza la función createProduccion actual por esta:
export const createProduccion = async (produccionData) => {
  const { detalle = [], ...produccionSinDetalles } = produccionData;

  try {
    // 1. Crear la producción sin detalles
    const produccionResponse = await axios.post(`${'http://localhost:3000/api'}/produccion`, produccionSinDetalles);
    const produccionCreada = produccionResponse.data;
    const produccionId = produccionCreada.ProduccionId;

    // 2. Si hay detalles, crearlos uno por uno
    if (Array.isArray(detalle) && detalle.length > 0) {
      const detallesPromises = detalle.map(item =>
        axios.post(`${'http://localhost:3000/api'}/detalle-produccion`, {
          ProduccionId: produccionId,
          InsumoId: item.InsumoId,
          CantidadUsada: item.CantidadUsada
        })
      );
      await Promise.all(detallesPromises);
    }

    // 3. Devolver la producción completa (como se espera en el frontend)
    return await getProduccionCompleta(produccionId);
  } catch (error) {
    console.error("Error creating producción:", error);
    throw error;
  }
};
export const updateProduccion = async (id, produccionData) => {
  try {
    const response = await axios.put(`${'http://localhost:3000/api'}/produccion/${id}`, produccionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating producción ${id}:`, error);
    throw error;
  }
};

export const deleteProduccion = async (id) => {
  try {
    const response = await axios.delete(`${'http://localhost:3000/api'}/produccion/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting producción ${id}:`, error);
    throw error;
  }
};

// === DETALLES DE PRODUCCIÓN ===
export const getDetallesByProduccionId = async (produccionId) => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api'}/detalle-produccion/${produccionId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error fetching detalles for producción ${produccionId}:`, error);
    throw error;
  }
};

export const createDetalleProduccion = async (detalleData) => {
  try {
    const response = await axios.post(`${'http://localhost:3000/api'}/detalle-produccion`, detalleData);
    return response.data;
  } catch (error) {
    console.error("Error creating detalle producción:", error);
    throw error;
  }
};

export const deleteDetalleProduccion = async (detalleId) => {
  try {
    const response = await axios.delete(`${'http://localhost:3000/api'}/detalle-produccion/${detalleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting detalle producción ${detalleId}:`, error);
    throw error;
  }
};

// === CATÁLOGOS RELACIONADOS ===
export const getAllPedidos = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api'}/pedidos-clientes`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching pedidos:", error);
    throw error;
  }
};

export const getAllInsumos = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000/api'}/insumos`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching insumos:", error);
    throw error;
  }
};

// === FUNCIONES ESPECIALES ===
export const getProduccionCompleta = async (produccionId) => {
  try {
    const [produccion, detalles] = await Promise.all([
      getProduccionById(produccionId),
      getDetallesByProduccionId(produccionId)
    ]);
    return { ...produccion, detalle: detalles };
  } catch (error) {
    console.error(`Error fetching producción completa ${produccionId}:`, error);
    throw error;
  }
};

export const updateProduccionConDetalles = async (produccionId, produccionData, nuevosDetalles) => {
  try {
    // 1. Actualizar la producción principal
    const produccionActualizada = await updateProduccion(produccionId, produccionData);
    
    // 2. Obtener detalles actuales
    const detallesActuales = await getDetallesByProduccionId(produccionId);
    
    // 3. Eliminar detalles antiguos
    await Promise.all(
      detallesActuales.map(detalle => 
        deleteDetalleProduccion(detalle.DetalleProduccionId)
      )
    );
    
    // 4. Crear nuevos detalles
    const detallesCreados = await Promise.all(
      nuevosDetalles.map(detalle => 
        createDetalleProduccion({
          ProduccionId: produccionId,
          InsumoId: detalle.InsumoId,
          CantidadUsada: detalle.CantidadUsada
        })
      )
    );
    
    return { produccionActualizada, detallesCreados };
  } catch (error) {
    console.error("Error updating producción con detalles:", error);
    throw error;
  }
};