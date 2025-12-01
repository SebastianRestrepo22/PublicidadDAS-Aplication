import {
    getAllDetallesModel,
    getDetalleByIdModel,
    getDetalleByCompraIdModel,
    createDetalleModel,
    deleteDetalleModel,
    updateDetalleModel 
} from '../models/detalleCompras.model.js';

// Obtener todos los detalles
export const getAllDetalles = async (req, res) => {
  try {
    const detalles = await getAllDetallesModel();
    res.json(detalles);
  } catch (err) {
    console.error("Error al obtener detalles:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Obtener detalle por ID
export const getDetalleById = async (req, res) => {
  const id = req.params.id;

  try {
    const detalle = await getDetalleByIdModel(id);
    if (!detalle) return res.status(404).json({ message: "Detalle no encontrado" });

    res.json(detalle);
  } catch (err) {
    console.error("Error al obtener detalle por ID:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Obtener detalles por ID de compra
export const getDetalleByCompraId = async (req, res) => {
  const CompraId = req.params.CompraId;

  try {
    const detalles = await getDetalleByCompraIdModel(CompraId);
    res.json(detalles);
  } catch (err) {
    console.error("Error al obtener detalles por compra:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Crear nuevo detalle
export const createDetalle = async (req, res) => {
  const { CompraId, TipoDetalle, ProductoServicioId, InsumoId, Cantidad, Descripcion } = req.body;

  if (!CompraId || !TipoDetalle || !Cantidad) {
    return res.status(400).json({
      error: "CompraId, TipoDetalle y Cantidad son obligatorios"
    });
  }

  try {
    const result = await createDetalleModel({
      CompraId,
      TipoDetalle,
      ProductoServicioId: ProductoServicioId || null,
      InsumoId: InsumoId || null,
      Cantidad,
      Descripcion: Descripcion || null
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("Error al crear el detalle:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Actualizar detalle
export const updateDetalle = async (req, res) => {
  const id = req.params.id;

  const { TipoDetalle, ProductoServicioId, InsumoId, Cantidad, Descripcion } = req.body;

  if (!id || id.length !== 36) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const result = await updateDetalleModel(id, {
      TipoDetalle,
      ProductoServicioId: ProductoServicioId || null,
      InsumoId: InsumoId || null,
      Cantidad,
      Descripcion: Descripcion || null
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Detalle no encontrado" });
    }

    res.json({ message: "Detalle actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar detalle:", err);
    res.status(500).json({ error: err.message });
  }
};

// Eliminar detalle
export const deleteDetalle = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await deleteDetalleModel(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Detalle no encontrado" });
    }

    res.json({ message: "Detalle eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar detalle:", err.message);
    res.status(500).json({ error: err.message });
  }
};
