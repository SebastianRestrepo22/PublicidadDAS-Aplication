// src/controllers/detalleProduccion.controller.js
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
    console.error("Error al obtener detalles de producción:", error);
    res.status(500).json({ error: "Error al obtener detalles de producción" });
  }
};

export const createDetalleProduccion = async (req, res) => {
  try {
    const { ProduccionId, InsumoId, CantidadUsada } = req.body;

    if (!ProduccionId || !InsumoId || CantidadUsada == null) {
      return res.status(400).json({ error: "ProduccionId, InsumoId y CantidadUsada son obligatorios" });
    }

    const nuevoDetalle = await createDetalleProduccionModel({
      ProduccionId: ProduccionId.toString().trim(),
      InsumoId: InsumoId.toString().trim(),
      CantidadUsada: Number(CantidadUsada)
    });

    res.status(201).json(nuevoDetalle);
  } catch (error) {
    console.error("Error al crear detalle de producción:", error);
    res.status(500).json({ error: "Error al crear detalle de producción" });
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
    console.error("Error al eliminar detalle de producción:", error);
    res.status(500).json({ error: "Error al eliminar detalle de producción" });
  }
};