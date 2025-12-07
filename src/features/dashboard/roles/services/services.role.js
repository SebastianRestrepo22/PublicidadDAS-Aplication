import axios from "axios"
const url = 'http://localhost:3000/'

// Listar todos los datos
export const GetDataRoles = async () => {
    try {
        const response = await axios.get(url + 'roles')
        console.log("------------ ", response)
        return response
    } catch (error) {
        return { status: false, message: "No esta la api : ", error }
    }
}

// Listar los datos de un regitro
export const postDataRoles = async (data) => {
    try {
        const response = await axios.post(url + 'roles', data)
        return response
    } catch (error) {
        return { status: false, message: "No esta la api : ", error }
    }
}

// Actualizar un registro
export const updateDataRol = async (id, data) => {
    try {
        const response = await axios.put(url + `roles/${id}`, data);
        return response; // Devuelve la respuesta de la API
    } catch (error) {
        return { status: false, message: "No se puede actualizar la compañía : ", error }; // Manejo de errores
    }
}

// Eliminar un registro
export const deleteDataRol = async (id) => {
    try {
        const response = await axios.delete(url + `roles/${id}`);
        return response; // Devuelve la respuesta de la API
    } catch (error) {
        return { status: false, message: "No se puede eliminar la compañía : ", error }; // Manejo de errores
    }
}

//Buscar roles

export const buscarRoles = async (campo, valor) => {
  try {
    const response = await axios.get(`${url}roles/buscar?campo=${campo}&valor=${valor}`);
    return response.data;
  } catch (error) {
    console.error("Error al buscar roles:", error);
    return [];
  }
};