import {
  getAllProduccionModel,
  getProduccionByIdModel,
  createProduccionModel,
  updateProduccionModel,
  deleteProduccionModel
} from "../models/produccion.model.js";

import {
    createDetalleProduccionModel,
    getDetalleProduccionByProduccionIdModel,
    deleteDetalleProduccionModel
} from "../models/detalleProduccion.model.js";


export const getProduccion = async (req, res) => {
    try {
        const produccion = await getAllProduccionModel();

        for (let p of produccion) {
            p.detalle = await getDetalleProduccionByProduccionIdModel(p.ProduccionId);
        }

        res.status(200).json(produccion);
    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        res.status(500).json({ error: "Error al la produccion" });
    }
};

/**
 * Obtener pedido por ID
 */
export const getProduccionById = async (req, res) => {
    try {
        const produccion = await getProduccionByIdModel(req.params.id);

        if (!produccion) {
            return res.status(404).json({ error: "Produccion no encontrada" });
        }

        produccion.detalle = await getDetalleProduccionByProduccionIdModel(req.params.id);

        res.status(200).json(produccion);
    } catch (error) {
        console.error("Error al obtener produccion:", error);
        res.status(500).json({ error: "Error al obtener produccion" });
    }
};

/**
 * Crear pedido + detalles
 */
export const createProduccion = async (req, res) => {
  const { PedidoClienteId, Estado, FechaInicio, FechaFin, detalle } = req.body;

  if (!PedidoClienteId || !FechaInicio) {
    return res.status(400).json({ error: "PedidoClienteId y FechaInicio son requeridos" });
  }

  const ProduccionId = uuidv4();

  let connection;

  try {
    connection = await getConnection();

    // Insertar master
    await connection.execute(
      `INSERT INTO produccion (ProduccionId, PedidoClienteId, Estado, FechaInicio, FechaFin)
       VALUES (?, ?, ?, ?, ?)`,
      [ProduccionId, PedidoClienteId, Estado || "En Proceso", FechaInicio, FechaFin || null]
    );

    // Insertar detalles
    if (Array.isArray(detalle)) {
      for (const d of detalle) {
        if (!d.InsumoId) continue;
        await connection.execute(
          `INSERT INTO detalle_produccion (ProduccionId, InsumoId, CantidadUsada)
           VALUES (?, ?, ?)`,
          [ProduccionId, d.InsumoId, Number(d.CantidadUsada) || 1]
        );
      }
    }

    res.status(201).json({ message: "Producción creada correctamente", ProduccionId });

  } catch (error) {
    console.error("Error creando producción:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Actualizar pedido
 */
export const updateProduccion = async (req, res) => {

    try {
        const result = await updateProduccionModel(req.params.id, req.body);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Produccion no encontrada" });
        }

        const produccionActualizada = await getProduccionByIdModel(req.params.id);
        produccionActualizada.detalle = await getDetalleProduccionByProduccionIdModel(req.params.id);

        res.status(200).json(produccionActualizada);
    } catch (error) {
        console.error("Error al actualizar la produccion:", error);
        res.status(500).json({ error: "Error al actualizar produccion" });
    }
};

/**
 * Eliminar pedido + detalles
 */
export const deleteProduccion = async (req, res) => {
    try {
        const detalles = await getDetalleProduccionByProduccionIdModel(req.params.id);

        for (let d of detalles) {
            await deleteDetalleProduccionModel(d.DetalleProduccionId);
        }

        const result = await deleteProduccionModel(req.params.id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Produccion no encontrada" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar produccion:", error);
        res.status(500).json({ error: "Error al eliminar produccion" });
    }
};
