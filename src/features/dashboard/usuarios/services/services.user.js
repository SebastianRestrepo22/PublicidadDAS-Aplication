import axios from "axios"
const url = 'http://localhost:3000/'

// Listar todos los datos
export const GetDataUser = async () => {
    try {
        const response = await axios.get(url + 'user')
        console.log("------------ ", response)
        return response
    } catch (error) {
        return { status: false, message: "No esta la api : ", error }
    }
}

// Listar los datos de un regitro
export const postDataUsers = async (data) => {
    try {
        const response = await axios.post(url + 'user', data)
        return response
    } catch (error) {
        return { status: false, message: "No esta la api : ", error }
    }
}

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
        return { status: false, message: "No se puede eliminar el usuario : ", error }; // Manejo de errores
    }
}

//Buscar usuarios

export const buscarUsuarios = async (campo, valor) => {
  try {
    const response = await axios.get(`${url}user/buscar?campo=${campo}&valor=${valor}`);
    return response.data;
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    return [];
  }
};
