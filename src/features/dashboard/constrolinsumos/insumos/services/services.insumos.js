import { data } from "react-router-dom";
import * as insumosModel from "../models/"

export const getAllInsumos = async () => {
    return await insumosModel.getAllInsumos();
};

export const getAllInsumosById = async () => {
    return await insumosModel.getAllInsumosById(id);
};

export const createInsumos = async () => {
    return await insumosModel.createInsumos(data);
};

export const updateInsumos = async () => {
    const result = await insumosModel.updateInsumos(id, data)
    if (result.affectedRows === 0) throw new Error(" Insumo no encontrado");
    return result;  
};

export const deleteInsumo = async () => {
    const result = await insumoModel.deleteInsumo(id);
    if (result.affectedRows === 0) throw new Error("Insumo no encontrado");
    return result;
};
