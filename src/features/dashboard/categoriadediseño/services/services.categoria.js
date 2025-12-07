import axios from "axios";

const url = "http://localhost:3000/api/";

// Listar todas las categorías
export const getAllCategorias = async () => {
  try {
    const response = await axios.get(url + "categorias");
    return response;
  } catch (error) {
    return { status: false, message: "No está la API de categorías", error };
  }
};

// Obtener una categoría por ID
export const getCategoriaById = async (id) => {
  try {
    const response = await axios.get(`${url}categorias/${id}`);
    return response;
  } catch (error) {
    return { status: false, message: "No se puede obtener la categoría", error };
  }
};

// Crear una nueva categoría
export const createCategoria = async (data) => {
  try {
    const response = await axios.post(url + "categorias", data);
    return response;
  } catch (error) {
    return { status: false, message: "No se puede crear la categoría", error };
  }
};

export const updateCategoria = async (id, data) => {
    const result = await categoriaModel.updateCategoria(id. data);
    if (result.affectedRows === 0) throw new Error(" Categoria no encontrada");
    return result;
};

export const deleteCategoria = async (data) => {
    const result = await categoriaModel.deleteCategoria(id);
    if (result.affectedRows === 0 ) throw new Error("Categoria no encontrada");
    return result;
    
};
