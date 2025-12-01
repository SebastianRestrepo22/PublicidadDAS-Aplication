import {
  getDetalleProduccionByProduccionIdModel,
  createDetalleProduccionModel,  
  deleteDetalleProduccionModel
} from "../models/detalleProduccion.model.js";

export const getDetallesByProduccion = async (req, res) => {
  try {
    const detalles = await getDetalleProduccionByProduccionIdModel(req.params.id);
    res.status(200).json(detalles);
  } catch (error) {
    console.error("Error al obtener detalles de produccion:", error);
    res.status(500).json({ error: "Error al obtener detalles de produccion" });
  }
};

// ← NUEVO CONTROLADOR
export const createDetalleProduccion = async (req, res) => {
  try {
    const { ProduccionId, Insumo, CantidadUsada } = req.body;

    if (!ProduccionId) {
      return res.status(400).json({ error: "ProduccionId es obligatorio" });
    }

    const nuevoDetalle = await createDetalleProduccionModel({
      ProduccionId,
      Insumo: Insumo?.toString().trim(),
      CantidadUsada,
      
    });

    res.status(201).json(nuevoDetalle);
  } catch (error) {
    console.error("Error al crear detalle de produccion:", error);
    res.status(500).json({ error: "Error al crear detalle de produccion" });
  }
};

export const deleteDetalleProduccion = async (req, res) => {
  try {
    const result = await deleteDetalleProduccionModel(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar detalle de produccion:", error);
    res.status(500).json({ error: "Error al eliminar detalle de produccion" });
  }
};
