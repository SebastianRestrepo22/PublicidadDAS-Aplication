// src/controllers/comprobante.controller.js
import { v4 as uuidv4 } from "uuid";
import path from "path";
import {
  createComprobanteModel,
  getComprobanteByPedidoIdModel,
  updateComprobanteModel
} from "../models/comprobante.model.js";

/**
 * Subir comprobante de pago vinculado a un pedido (UUID)
 */
export const uploadComprobante = async (req, res) => {
  try {
    const { pedidoId } = req.body; // Este es el UUID del pedido
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }

    if (!pedidoId || typeof pedidoId !== "string" || pedidoId.length !== 36) {
      return res.status(400).json({ error: "ID de pedido inválido (se espera UUID)" });
    }

    // Ruta relativa para guardar en public/comprobantes
    const rutaArchivo = path.join("comprobantes", file.filename).replace(/\\/g, "/");

    // El modelo se encargará de generar el ComprobanteId (UUID)
    const nuevoComprobante = await createComprobanteModel({
      PedidoClienteId: pedidoId,
      RutaArchivo: rutaArchivo
    });

    res.status(201).json(nuevoComprobante);
  } catch (error) {
    console.error("Error al subir comprobante:", error);
    res.status(500).json({ error: "Error al guardar el comprobante" });
  }
};

/**
 * Obtener comprobante por ID de pedido (UUID)
 */
export const getComprobanteByPedidoId = async (req, res) => {
  try {
    const { id } = req.params; // UUID del pedido

    if (!id || id.length !== 36) {
      return res.status(400).json({ error: "ID de pedido inválido" });
    }

    const comprobante = await getComprobanteByPedidoIdModel(id);
    if (!comprobante) {
      return res.status(404).json({ error: "Comprobante no encontrado para este pedido" });
    }

    // Devuelve la URL pública del archivo
    const urlPublica = `${req.protocol}://${req.get("host")}/${comprobante.RutaArchivo}`;
    res.json({ ...comprobante, UrlPublica: urlPublica });
  } catch (error) {
    console.error("Error al obtener comprobante:", error);
    res.status(500).json({ error: "Error al obtener el comprobante" });
  }
};

/**
 * Actualizar estado del comprobante (usado por admin)
 * También actualiza el estado del pedido a "aprobado" si se verifica
 */
export const updateComprobanteEstado = async (req, res) => {
  try {
    const { id } = req.params; // ComprobanteId (UUID)
    const { Estado, Notas } = req.body;

    if (!["pendiente", "verificado", "rechazado"].includes(Estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const updated = await updateComprobanteModel(id, { Estado, Notas });
    if (!updated) {
      return res.status(404).json({ error: "Comprobante no encontrado" });
    }

    // Si se verificó, también actualizamos el estado del pedido
    if (Estado === "verificado") {
      // Primero, obtenemos el pedido asociado
      const comprobante = await getComprobanteByPedidoIdModelPorComprobanteId(id);
      if (comprobante) {
        // Aquí llamas a tu modelo de pedidos para actualizar su estado
        await updatePedidoEstadoModel(comprobante.PedidoClienteId, "aprobado");
      }
    }

    res.status(200).json({ message: "Comprobante actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar comprobante:", error);
    res.status(500).json({ error: "Error al actualizar el comprobante" });
  }
};