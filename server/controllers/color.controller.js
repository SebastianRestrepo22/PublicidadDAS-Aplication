import { getAllColoresDB, getColoresByProductoId, setColoresProducto } from "../models/color.model.js";

export const getColores = async (req, res) => {
    try {
        const colores = await getAllColoresDB();
        res.status(200).json(colores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener colores" });
    }
};

export const getColoresProducto = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'ProductoId requerido' });
    }

    try {
        const colores = await getColoresByProductoId(id);
        res.status(200).json(colores);
    } catch (error) {
        console.error('Error al obtener colores del producto:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};

export const updateColoresProducto = async (req, res) => {
  const { id } = req.params;
  const { colores } = req.body;

  if (!Array.isArray(colores)) {
    return res.status(400).json({ message: 'colores debe ser un array' });
  }

  try {
    await setColoresProducto(id, colores);
    res.status(200).json({ message: 'Colores actualizados' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno' });
  }
};



