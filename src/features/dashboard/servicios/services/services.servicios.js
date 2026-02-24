// services/services.servicios.js
import axios from "axios"
const url = 'http://localhost:3000/'

// Listar todos los datos
export const GetDataservicios = async () => {
    try {
        const response = await axios.get(url + 'servicio')
        console.log("GetDataservicios response:", response)
        return response
    } catch (error) {
        console.error("Error en GetDataservicios:", error)
        return { status: false, message: "No esta la api : ", error }
    }
}

// Crear servicio
export const postDataservicios = async (data) => {
    try {
        console.log("postDataservicios - data enviada:", data)
        const response = await axios.post(url + 'servicio', data)
        console.log("postDataservicios - respuesta:", response)
        return response
    } catch (error) {
        console.error("Error en postDataservicios:", error)
        console.error("Error response:", error.response)
        return { status: false, message: "No esta la api : ", error }
    }
}

// Actualizar un registro
export const updateDataservicios = async (id, data) => {
    try {
        console.log("updateDataservicios - id:", id, "data:", data)
        const response = await axios.put(url + `servicio/${id}`, data);
        console.log("updateDataservicios - respuesta:", response)
        return response;
    } catch (error) {
        console.error("Error en updateDataservicios:", error)
        return { status: false, message: "No se puede actualizar el usuario : ", error };
    }
}

// Eliminar un registro
export const deleteDataservicio = async (id) => {
    try {
        console.log("deleteDataservicio - id:", id)
        const response = await axios.delete(url + `servicio/${id}`);
        console.log("deleteDataservicio - respuesta:", response)
        return response;
    } catch (error) {
        console.error("Error en deleteDataservicio:", error)
        return { status: false, message: "No se puede eliminar el usuario : ", error };
    }
}

// Cambiar estado del servicio (toggle)
export const cambiarEstadoServicio = async (id, nuevoEstado) => {
    try {
        console.log("cambiarEstadoServicio - id:", id, "nuevoEstado:", nuevoEstado)
        const response = await axios.patch(url + `servicio/${id}/estado`, { Estado: nuevoEstado });
        console.log("cambiarEstadoServicio - respuesta:", response)
        return response;
    } catch (error) {
        console.error("Error en cambiarEstadoServicio:", error)
        return { status: false, message: "No se puede cambiar el estado : ", error };
    }
}

// Buscar servicios
export const buscarservicios = async (campo, valor) => {
    try {
        console.log("buscarservicios - campo:", campo, "valor:", valor)
        const response = await axios.get(
            `${url}servicio/buscar`,
            { params: { campo, valor } }
        );
        console.log("buscarservicios - respuesta:", response)
        return response.data.results;
    } catch (error) {
        console.error("Error en buscarservicios:", error)
        return [];
    }
}

// ==============================================
// FUNCIONES PARA TAMAÑOS 
// ==============================================

// Obtener tamaños de un servicio
export const getTamanosByServicio = async (servicioId) => {
    try {
        console.log("getTamanosByServicio - servicioId:", servicioId)
        const response = await axios.get(url + `api/servicio/${servicioId}/tamanos`);
        console.log("getTamanosByServicio - respuesta:", response)
        return response.data;
    } catch (error) {
        console.error("Error en getTamanosByServicio:", error)
        return [];
    }
}

// Crear tamaño para un servicio
export const createTamano = async (servicioId, data) => {
    try {
        console.log("createTamano - servicioId:", servicioId, "data:", data)
        const response = await axios.post(url + `api/servicio/${servicioId}/tamanos`, data);
        console.log("createTamano - respuesta:", response)
        return response;
    } catch (error) {
        console.error("Error en createTamano:", error)
        return { status: false, message: "Error al crear tamaño", error };
    }
}

// Actualizar todos los tamaños de un servicio
export const updateTamanosServicio = async (servicioId, tamanos) => {
    try {
        console.log("updateTamanosServicio - servicioId:", servicioId, "tamanos:", tamanos)
        const response = await axios.put(url + `api/servicio/${servicioId}/tamanos`, { tamanos });
        console.log("updateTamanosServicio - respuesta:", response)
        return response;
    } catch (error) {
        console.error("Error en updateTamanosServicio:", error)
        return { status: false, message: "Error al actualizar tamaños", error };
    }
}

// Actualizar un tamaño específico
export const updateTamano = async (servicioTamanoId, data) => {
    try {
        console.log("updateTamano - servicioTamanoId:", servicioTamanoId, "data:", data)
        const response = await axios.put(url + `api/servicio/tamano/${servicioTamanoId}`, data);
        console.log("updateTamano - respuesta:", response)
        return response;
    } catch (error) {
        console.error("Error en updateTamano:", error)
        return { status: false, message: "Error al actualizar tamaño", error };
    }
}

// Eliminar un tamaño
export const deleteTamano = async (servicioTamanoId) => {
    try {
        console.log("deleteTamano - servicioTamanoId:", servicioTamanoId)
        const response = await axios.delete(url + `api/servicio/tamano/${servicioTamanoId}`);
        console.log("deleteTamano - respuesta:", response)
        return response;
    } catch (error) {
        console.error("Error en deleteTamano:", error)
        return { status: false, message: "Error al eliminar tamaño", error };
    }
}