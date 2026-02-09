import axios from "axios"
const url = 'http://localhost:3000/'

// Cambiar estado del producto
export const cambiarEstadoProducto = async (id, Estado) => {
  try {
    const response = await axios.put(`${url}producto/${id}/estado`, { Estado });
    return response;
  } catch (error) {
    return { status: false, message: "Error al cambiar estado", error };
  }
};

// Listar todos los datos con filtro de estado
export const GetDataproductos = async (soloActivos = true) => {
  try {
    const response = await axios.get(`${url}producto${soloActivos ? '?estado=Activo' : ''}`);
    return response;
  } catch (error) {
    return { status: false, message: "No está la api : ", error };
  }
};

// Crear producto - NO elimines Stock
export const postDataproductos = async (data) => {
  console.log('=== SERVICES POST - DATOS A ENVIAR ===');
  console.log('Datos completos:', JSON.stringify(data, null, 2));
  console.log('Stock:', data.Stock, 'Tipo:', typeof data.Stock);
  console.log('=====================================');
  
  try {
    // ¡NO ELIMINES STOCK! El backend lo necesita
    const response = await axios.post(url + 'producto', data);
    return response;
  } catch (error) {
    console.error('Error en postDataproductos:', error.response?.data);
    return { status: false, message: "No esta la api : ", error };
  }
};

// Actualizar un registro - NO elimines Stock
export const updateDataproductos = async (id, data) => {
  console.log('=== SERVICES UPDATE - DATOS A ENVIAR ===');
  console.log('ID:', id);
  console.log('Datos completos:', JSON.stringify(data, null, 2));
  console.log('Stock:', data.Stock, 'Tipo:', typeof data.Stock);
  console.log('======================================');
  
  try {
    // ¡NO ELIMINES STOCK! El backend lo necesita
    const response = await axios.put(url + `producto/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error en updateDataproductos:', error.response?.data);
    return { status: false, message: "No se puede actualizar el usuario : ", error };
  }
};

// Eliminar un registro
export const deleteDataproducto = async (id) => {
    try {
        const response = await axios.delete(url + `producto/${id}`);
        return response;
    } catch (error) {
        return { status: false, message: "No se puede eliminar el usuario : ", error };
    }
}

// Buscar productos
export const buscarProductos = async (campo, valor) => {
    const response = await axios.get(
        `${url}producto/buscar`,
        { params: { campo, valor } }
    );
    return response.data.results;
};

export const updateColoresProducto = async (productoId, coloresConStock) => {
  console.log('Enviando colores para producto:', productoId);
  console.log('Datos a enviar:', coloresConStock);
  
  // Asegurar que estamos enviando el formato correcto
  const coloresParaEnviar = coloresConStock.map(c => {
    return {
      ColorId: String(c.ColorId),
      Stock: c.Stock || 0
    };
  });
  
  console.log('Formato enviado:', coloresParaEnviar);
  
  try {
    const response = await axios.post(
      `${url}producto/${productoId}/colores`,
      { colores: coloresParaEnviar }
    );
    return response.data;
  } catch (error) {
    console.error('Error en updateColoresProducto:', error.response?.data || error.message);
    throw error;
  }
};

export const getColores = async () => {
  const res = await axios.get("http://localhost:3000/colores");
  return res.data;
};

export const getColoresProducto = async (productoId) => {
  const res = await axios.get(`${url}producto/${productoId}/colores`);
  return res.data;
};

export const getProductoByIdService = async (id) => {
  try {
    const res = await axios.get(`${url}producto/${id}`);
    return res.data;
  } catch (error) {
    return { status: false, message: "No se pudo obtener el producto", error };
  }
};