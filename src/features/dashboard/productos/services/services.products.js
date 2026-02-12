import axios from "axios"
const url = 'http://localhost:3000/'

// Listar todos los datos
export const GetDataproductos = async () => {
    try {
        const response = await axios.get(url + 'producto')
        console.log("------------ ", response)
        return response
    } catch (error) {
        return { status: false, message: "No esta la api : ", error }
    }
}

// Listar los datos de un regitro
export const postDataproductos = async (data) => {
    try {
        const response = await axios.post(url + 'producto', data)
        return response
    } catch (error) {
        return { status: false, message: "No esta la api : ", error }
    }
}

// Actualizar un registro
export const updateDataproductos = async (id, data) => {
    try {
        const response = await axios.put(url + `producto/${id}`, data);
        return response; // Devuelve la respuesta de la API
    } catch (error) {
        return { status: false, message: "No se puede actualizar el usuario : ", error }; // Manejo de errores
    }
}

// Eliminar un registro
export const deleteDataproducto = async (id) => {
    try {
        const response = await axios.delete(url + `producto/${id}`);
        return response; // Devuelve la respuesta de la API
    } catch (error) {
        return { status: false, message: "No se puede eliminar el usuario : ", error }; // Manejo de errores
    }
}

//Buscar usuarios

export const buscarProductos = async (campo, valor) => {
    const response = await axios.get(
        `${url}producto/buscar`,
        { params: { campo, valor } }
    );
    return response.data.results;
};

export const updateColoresProducto = async (productoId, colores) => {
  const response = await axios.post(
    `${url}producto/${productoId}/colores`,
    { colores }
  );
  return response.data;
};  

export const getColores = async () => {
  const res = await axios.get("http://localhost:3000/colores");
  return res.data;
};

export const getColoresProducto = async (productoId) => {
  const res = await axios.get(
    `${url}producto/${productoId}/colores`
  );
  return res.data;
};

export const getProductoByIdService = async (id) => {
  try {
    const res = await axios.get(`${url}producto/${id}`);
    return res.data; // Esto es el objeto del producto
  } catch (error) {
    return { status: false, message: "No se pudo obtener el producto", error };
  }
};
