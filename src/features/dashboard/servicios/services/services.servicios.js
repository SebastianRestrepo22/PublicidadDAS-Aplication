import axios from "axios"
const url = 'http://localhost:3000/'

// Listar todos los datos
export const GetDataServices = async () => {
    try {
        const response = await axios.get(url + 'service')
        console.log("------------ ", response)
        return response
    } catch (error) {
        return { status: false, message: "No esta la api : ", error }
    }
}

// Listar los datos de un regitro
export const postDataServices = async (data) => {
    try {
        const response = await axios.post(url + 'service', data)
        return response
    } catch (error) {
        return { status: false, message: "No esta la api : ", error }
    }
}

// Actualizar un registro
export const updateDataServices = async (id, data) => {
    try {
        const response = await axios.put(url + `service/${id}`, data);
        return response; // Devuelve la respuesta de la API
    } catch (error) {
        return { status: false, message: "No se puede actualizar el usuario : ", error }; // Manejo de errores
    }
}

// Eliminar un registro
export const deleteDataService = async (id) => {
    try {
        const response = await axios.delete(url + `service/${id}`);
        return response; // Devuelve la respuesta de la API
    } catch (error) {
        return { status: false, message: "No se puede eliminar el usuario : ", error }; // Manejo de errores
    }
}

//Buscar usuarios

export const buscarServicios = async (campo, valor) => {
  try {
    const response = await axios.get(`${url}service/buscar?campo=${campo}&valor=${valor}`);
    return response.data;
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    return [];
  }
};
