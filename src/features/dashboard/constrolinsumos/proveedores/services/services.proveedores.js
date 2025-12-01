import * as proveedoresModel from "../models/proveedores.model.js";

// Obtener todos los proveedores
export const getAllProveedores = async () => {
    return await proveedoresModel.getAllProveedores();
};

// Obtener proveedor por ID
export const getProveedorById = async (id) => {
    return await proveedoresModel.getProveedorById(id);
};

// Crear un proveedor
export const createProveedor = async (data) => {
    return await proveedoresModel.createProveedor(data);
};

// Actualizar proveedor
export const updateProveedor = async (id, data) => {
    const result = await proveedoresModel.updateProveedor(id, data);

    if (result.affectedRows === 0) {
        throw new Error("Proveedor no encontrado");
    }

    return result;
};

// Eliminar proveedor
export const deleteProveedor = async (id) => {
    const result = await proveedoresModel.deleteProveedor(id);

    if (result.affectedRows === 0) {
        throw new Error("Proveedor no encontrado");
    }

    return result;
};
