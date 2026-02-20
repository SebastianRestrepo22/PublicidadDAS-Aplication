import axios from "axios";

const url = 'http://localhost:3000/client';

// Listar todos los clientes
export const getDataClients = async () => {
    try {
        const response = await axios.get(url);
        return response;
    } catch (error) {
        return { status: false, message: "No esta la api : ", error };
    }
};

// Crear cliente
export const postDataClients = async (data) => {
    try {
        const response = await axios.post(url, data);
        return response;
    } catch (error) {
        return { status: false, message: "No esta la api : ", error };
    }
};

// Obtener cliente por ID
export const getClientById = async (id) => {
    try {
        const response = await axios.get(`${url}/${id}`);
        return response;
    } catch (error) {
        return { status: false, message: "No se pudo obtener el cliente : ", error };
    }
};

// Actualizar cliente
export const updateDataClient = async (id, data) => {
    try {
        const response = await axios.put(`${url}/${id}`, data);
        return response;
    } catch (error) {
        return { status: false, message: "No se puede actualizar el cliente : ", error };
    }
};

// Eliminar cliente
export const deleteDataClient = async (id) => {
    try {
        const response = await axios.delete(`${url}/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};
