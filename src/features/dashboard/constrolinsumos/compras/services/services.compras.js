import axios from "axios";

const API_URL = 'http://localhost:3000';

// === Compras ===

export const getAllCompras = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/compras`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error en getAllCompras:", error);
    throw error;
  }
};

export const getCompraById = async (id) => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/compras/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error en getCompraById:", error);
    throw error;
  }
};

export const createCompra = async (compraData) => {
  try {
    const response = await axios.post(`${'http://localhost:3000'}/api/compras`, compraData);
    return response.data;
  } catch (error) {
    console.error("Error en createCompra:", error);
    throw error;
  }
};

export const updateCompra = async (id, compraData) => {
  try {
    const response = await axios.put(`${'http://localhost:3000'}/api/compras/${id}`, compraData);
    return response.data;
  } catch (error) {
    console.error("Error en updateCompra:", error);
    throw error;
  }
};

// Servicio específico para actualizar estado - USANDO PATCH
export const updateCompraEstado = async (id, nuevoEstado, options = {}) => {
  try {
    console.log("Llamando a PATCH:", { id, nuevoEstado, options }); // LOG PARA DEBUG
    
    const response = await axios.patch(`${'http://localhost:3000'}/api/compras/${id}/estado`, {
      estado: nuevoEstado,
      productos: options.productos,
      motivoCancelacion: options.motivoCancelacion
    });
    
    console.log("Respuesta del servidor:", response.data); // LOG PARA DEBUG
    return response.data;
  } catch (error) {
    console.error("Error en updateCompraEstado:", error);
    console.error("Detalles del error:", error.response?.data); // LOG PARA DEBUG
    throw error;
  }
};

export const deleteCompra = async (id) => {
  try {
    const response = await axios.delete(`${'http://localhost:3000'}/api/compras/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error en deleteCompra:", error);
    throw error;
  }
};

export const getDetallesByCompraId = async (compraId) => {
  try {
    console.log("🔵 [getDetallesByCompraId] Obteniendo detalles para compra:", compraId);
    
    // Cambia esta URL a la ruta correcta que definimos
    const response = await fetch(`http://localhost:3000/api/detalle-compras/compra/${compraId}`);
    
    console.log("🟡 [getDetallesByCompraId] Response status:", response.status);
    
    if (!response.ok) {
      console.error("🔴 [getDetallesByCompraId] Error response:", response.status, response.statusText);
      return []; // Retornar array vacío en caso de error
    }
    
    const data = await response.json();
    console.log("🟢 [getDetallesByCompraId] Datos recibidos:", data);
    
    // Asegurarse de que siempre retorne un array
    return Array.isArray(data) ? data : [];
    
  } catch (error) {
    console.error("🔴 [getDetallesByCompraId] Error en getDetallesByCompraId:", error);
    return []; // Retornar array vacío en caso de error
  }
};

export const createDetalleCompra = async (detalleData) => {
  try {
    console.log("🔵 Datos recibidos en createDetalleCompra:", detalleData);
    
    // Crear una copia profunda de los datos
    const dataToSend = {
      CompraId: detalleData.CompraId,
      ProductoId: detalleData.ProductoId,
      Cantidad: Number(detalleData.Cantidad) || 0,
      PrecioUnitario: Number(detalleData.PrecioUnitario) || 0,
      Descripcion: detalleData.Descripcion || null
    };
    
    // Procesar colores CORRECTAMENTE
    if (detalleData.colores && Array.isArray(detalleData.colores) && detalleData.colores.length > 0) {
      console.log("Procesando colores:", detalleData.colores);
      
      // Asegurar que cada color sea un objeto plano con los campos correctos
      const coloresProcesados = detalleData.colores.map(color => {
        // Si el color ya es un objeto, extraer sus propiedades
        if (typeof color === 'object' && color !== null) {
          return {
            ColorId: String(color.ColorId || color.colorId || ''),
            Stock: Number(color.Stock || color.stock || 0),
            Nombre: String(color.Nombre || color.nombre || 'Color'),
            Hex: String(color.Hex || color.hex || '#CCCCCC')
          };
        }
        return color;
      });
      
      console.log("Colores procesados:", coloresProcesados);
      
      // Enviar el array directamente, el modelo se encargará de stringify
      dataToSend.colores = coloresProcesados;
    } else {
      dataToSend.colores = [];
    }
    
    console.log("🔵 Enviando a BD:", dataToSend);
    
    const response = await fetch(`http://localhost:3000/api/detalle-compras`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔴 Respuesta error:", errorText);
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("🟢 Respuesta BD:", result);
    return result;
    
  } catch (error) {
    console.error("🔴 Error en createDetalleCompra:", error);
    throw error;
  }
};

// === Catálogos ===
export const getAllProductos = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/producto`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error en getAllProductos:", error);
    throw error;
  }
};

export const getAllProveedores = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/proveedores`);
    return response.data;
  } catch (error) {
    console.error("Error en getAllProveedores:", error);
    throw error;
  }
};

export const getProveedoresPaginados = async (page = 1, limit = 5, search = "") => {
  try {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", limit);
    if (search) params.set("search", search);

    const response = await axios.get(`${'http://localhost:3000'}/api/proveedores?${params.toString()}`);

    if (response.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        total: response.data.total || response.data.data.length,
      };
    } else if (Array.isArray(response.data)) {
      const total = response.data.length;
      const start = (page - 1) * limit;
      const paginated = response.data.slice(start, start + limit);
      return {
        data: paginated,
        total,
      };
    } else {
      return { data: [], total: 0 };
    }
  } catch (error) {
    console.error("Error en getProveedoresPaginados:", error);
    throw error;
  }
};

export const getProductosPaginados = async (page = 1, limit = 5, search = "") => {
  try {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", limit);
    if (search) params.set("search", search);

    const response = await axios.get(`${'http://localhost:3000'}/producto?${params.toString()}`);
    
    const data = Array.isArray(response.data) ? response.data : [];
    
    return { 
      data, 
      total: data.length 
    };
  } catch (error) {
    console.error("Error en getProductosPaginados:", error);
    throw error;
  }
};