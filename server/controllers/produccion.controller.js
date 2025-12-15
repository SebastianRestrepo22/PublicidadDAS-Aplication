// src/controllers/produccion.controller.js
import {
  getAllProduccionModel,
  getProduccionByIdModel,
  createProduccionModel,
  updateProduccionModel,
  deleteProduccionModel
} from "../models/produccion.model.js";

import {
  getDetalleProduccionByProduccionIdModel,
  deleteDetalleProduccionModel as deleteDetalleModel
} from "../models/detalleProduccion.model.js";

import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js";

// Obtener todas las producciones con sus detalles
export const getProduccion = async (req, res) => {
  try {
    const produccion = await getAllProduccionModel();

    for (let p of produccion) {
      p.detalle = await getDetalleProduccionByProduccionIdModel(p.ProduccionId);
    }

    res.status(200).json(produccion);
  } catch (error) {
    console.error("Error al obtener producciones:", error);
    res.status(500).json({ error: "Error al obtener producciones" });
  }
};

// Obtener producción por ID
export const getProduccionById = async (req, res) => {
  try {
    const produccion = await getProduccionByIdModel(req.params.id);

    if (!produccion) {
      return res.status(404).json({ error: "Producción no encontrada" });
    }

    produccion.detalle = await getDetalleProduccionByProduccionIdModel(req.params.id);
    res.status(200).json(produccion);
  } catch (error) {
    console.error("Error al obtener producción:", error);
    res.status(500).json({ error: "Error al obtener producción" });
  }
};

// Crear producción + detalles (en una transacción idealmente)
export const createProduccion = async (req, res) => {
  const { PedidoClienteId, Estado, FechaInicio, FechaFin, detalle } = req.body;

  if (!PedidoClienteId || !FechaInicio) {
    return res.status(400).json({ error: "PedidoClienteId y FechaInicio son requeridos" });
  }

  let connection;
  try {
    connection = await connectDB();
    await connection.beginTransaction();

    const ProduccionId = uuidv4();

    // Insertar producción
    await connection.execute(
      `INSERT INTO produccion (ProduccionId, PedidoClienteId, Estado, FechaInicio, FechaFin)
       VALUES (?, ?, ?, ?, ?)`,
      [ProduccionId, PedidoClienteId, Estado || "En Proceso", FechaInicio, FechaFin || null]
    );

    // Insertar detalles
    if (Array.isArray(detalle)) {
      for (const d of detalle) {
        if (!d.InsumoId || !d.CantidadUsada) continue;
        await connection.execute(
          `INSERT INTO detalleproduccion (DetalleProduccionId, ProduccionId, InsumoId, CantidadUsada)
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), ProduccionId, d.InsumoId, Number(d.CantidadUsada)]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: "Producción creada correctamente", ProduccionId });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error creando producción:", error);
    res.status(500).json({ error: "Error al crear producción" });
  } finally {
    if (connection) connection.release();
  }
};

// Actualizar producción
export const updateProduccion = async (req, res) => {
  try {
    const result = await updateProduccionModel(req.params.id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producción no encontrada" });
    }

    const produccionActualizada = await getProduccionByIdModel(req.params.id);
    produccionActualizada.detalle = await getDetalleProduccionByProduccionIdModel(req.params.id);
    res.status(200).json(produccionActualizada);
  } catch (error) {
    console.error("Error al actualizar producción:", error);
    res.status(500).json({ error: "Error al actualizar producción" });
  }
};

// Eliminar producción + detalles
export const deleteProduccion = async (req, res) => {
  let connection;
  try {
    connection = await connectDB();
    await connection.beginTransaction();

    // Eliminar detalles primero
    await connection.execute("DELETE FROM detalleproduccion WHERE ProduccionId = ?", [req.params.id]);

    // Eliminar producción
    const [result] = await connection.execute("DELETE FROM produccion WHERE ProduccionId = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Producción no encontrada" });
    }

    await connection.commit();
    res.status(204).send();
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error al eliminar producción:", error);
    res.status(500).json({ error: "Error al eliminar producción" });
  } finally {
    if (connection) connection.release();
  }
};