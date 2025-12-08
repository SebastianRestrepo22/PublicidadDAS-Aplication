import {
    getAllCompras as getAllComprasModel,
    getCompraById as getCompraByIdModel,
    createCompra as createCompraModel,
    deleteCompra as deleteCompraModel,
    updateCompra as updateCompraModel
} from '../models/compras.model.js';

//  Normalizar Estado para evitar Buffer, Array, etc.
const normalizeEstado = (estado) => {
  if (estado === null || estado === undefined) return 0;
  if (typeof estado === "number") return estado;
  if (typeof estado === "boolean") return estado ? 1 : 0;
  if (estado.data) return estado.data[0];        // Buffer → número
  if (estado[0] !== undefined) return estado[0]; // Array → número
  return 0;
};

// Obtener todas las compras
export const getAllCompras = async (req, res) => {
  try {
    const compras = await getAllComprasModel();

    // 🔥 Normalizar Estado ANTES de enviar al frontend
    const comprasLimpias = compras.map(c => ({
      ...c,
      Estado: normalizeEstado(c.Estado)
    }));

    res.json(comprasLimpias);
  } catch (err) {
    console.error("Error al obtener las compras:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Obtener compra por ID
export const getCompraById = async (req, res) => {
  const id = req.params.id;

  try {
    const compra = await getCompraByIdModel(id);
    if (!compra) return res.status(404).json({ message: "Compra no encontrada" });

    compra.Estado = normalizeEstado(compra.Estado);

    res.json(compra);
  } catch (err) {
    console.error("Error al obtener compra por ID:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Crear nueva compra
export const createCompra = async (req, res) => {
  const { ProveedorId, Total, FechaRegistro, Estado } = req.body;

  if (!ProveedorId || Total === undefined || !FechaRegistro || Estado === undefined) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const result = await createCompraModel({
      ProveedorId,
      Total,
      FechaRegistro,
      Estado
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("Error al crear la compra:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Eliminar compra
export const deleteCompra = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await deleteCompraModel(id);

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Compra no encontrada" });
    }

    res.json({ message: "Compra eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar compra:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Actualizar compra
export const updateCompra = async (req, res) => {
  const id = req.params.id;

  if (!id || id.length !== 36){
    return res.status(400).json({ error: "ID invalido"} )
  }

  const { ProveedorId, Total, FechaRegistro, Estado } = req.body;

  try {
    const result = await updateCompraModel(id, {
      ProveedorId,
      Total,
      FechaRegistro,
      Estado
    });

    if (result.affectedRows === 0 ) {
       return res.status(404).json({ message: "Compra no encontrada" });
    }

    res.json({ message: "Compra actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar compra:", err);
    res.status(500).json({ error: err.message });
  }
};