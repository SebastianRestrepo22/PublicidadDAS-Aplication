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
  console.log("📥 [COMPROBANTE] === NUEVA PETICIÓN DE SUBIDA ===");
  console.log("📁 Archivo recibido:", req.file ? req.file.originalname : "❌ NINGUNO");
  console.log("📦 Body recibido:", req.body);

  // Validación 1: archivo
  if (!req.file) {
    console.warn("⚠️ [COMPROBANTE] Error: No se recibió ningún archivo");
    return res.status(400).json({ error: "Debes adjuntar un comprobante (imagen o PDF)" });
  }

  // Validación 2: pedidoId
  const { pedidoId } = req.body;
  if (!pedidoId || typeof pedidoId !== "string" || pedidoId.length !== 36) {
    console.warn("⚠️ [COMPROBANTE] Error: pedidoId inválido:", pedidoId);
    return res.status(400).json({ error: "ID de pedido inválido (debe ser un UUID de 36 caracteres)" });
  }

  try {
    // Construir ruta relativa (para la DB y el acceso público)
    const rutaArchivo = `comprobantes/${req.file.filename}`.replace(/\\/g, "/");
    console.log("💾 Ruta de archivo para guardar en DB:", rutaArchivo);

    // Guardar en base de datos
    console.log("🗄️ Guardando comprobante en la base de datos...");
    const nuevoComprobante = await createComprobanteModel({
      PedidoClienteId: pedidoId,
      RutaArchivo: rutaArchivo
    });

    console.log("✅ [COMPROBANTE] ¡Éxito! Comprobante creado con ID:", nuevoComprobante.ComprobanteId);
    res.status(201).json({
      ComprobanteId: nuevoComprobante.ComprobanteId,
      PedidoClienteId: pedidoId,
      RutaArchivo: rutaArchivo,
      UrlPublica: `/${rutaArchivo}`
    });

  } catch (error) {
    console.error("💥 [COMPROBANTE] Error FATAL al guardar en la base de datos:", error);
    // Opcional: log de error específico de MySQL
    if (error.code) {
      console.error("🔧 Código de error de MySQL:", error.code);
    }
    res.status(500).json({ error: "Error interno al procesar el comprobante" });
  }
};

/**
 * Obtener comprobante por ID de pedido (UUID)
 */
export const getComprobanteByPedidoId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 [COMPROBANTE] Buscando comprobante para pedido:", id);

    if (!id || id.length !== 36) {
      return res.status(400).json({ error: "ID de pedido inválido" });
    }

    const comprobante = await getComprobanteByPedidoIdModel(id);
    if (!comprobante) {
      console.log("ℹ️ [COMPROBANTE] No se encontró comprobante para el pedido:", id);
      return res.status(404).json({ error: "Comprobante no encontrado para este pedido" });
    }

    const urlPublica = `/${comprobante.RutaArchivo}`;
    console.log("✅ [COMPROBANTE] Comprobante encontrado. URL pública:", urlPublica);
    res.json({ ...comprobante, UrlPublica: urlPublica });
  } catch (error) {
    console.error("💥 [COMPROBANTE] Error al obtener comprobante:", error);
    res.status(500).json({ error: "Error al obtener el comprobante" });
  }
};

/**
 * Actualizar estado del comprobante (usado por admin)
 */
export const updateComprobanteEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { Estado, Notas } = req.body;
    console.log("🔄 [COMPROBANTE] Actualizando estado del comprobante:", id, "→", Estado);

    if (!["pendiente", "verificado", "rechazado"].includes(Estado)) {
      return res.status(400).json({ error: "Estado inválido. Valores permitidos: pendiente, verificado, rechazado" });
    }

    const updated = await updateComprobanteModel(id, { Estado, Notas });
    if (!updated) {
      console.warn("⚠️ [COMPROBANTE] Comprobante no encontrado para actualizar:", id);
      return res.status(404).json({ error: "Comprobante no encontrado" });
    }

    console.log("✅ [COMPROBANTE] Estado actualizado correctamente.");
    res.status(200).json({ message: "Comprobante actualizado correctamente" });
  } catch (error) {
    console.error("💥 [COMPROBANTE] Error al actualizar comprobante:", error);
    res.status(500).json({ error: "Error al actualizar el comprobante" });
  }
};