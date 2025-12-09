// src/models/comprobante.model.js
import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js"; // ← Usa la función, no la conexión directa

/**
 * Crea un nuevo comprobante de pago
 */
export const createComprobanteModel = async (comprobanteData) => {
  const { PedidoClienteId, RutaArchivo } = comprobanteData;
  const ComprobanteId = uuidv4();

  const connection = await connectDB(); // ← Obtén una conexión segura

  const query = `
    INSERT INTO comprobantes_pago 
    (ComprobanteId, PedidoClienteId, RutaArchivo, Estado) 
    VALUES (?, ?, ?, 'pendiente')
  `;

  const [result] = await connection.execute(query, [ComprobanteId, PedidoClienteId, RutaArchivo]);

  if (result.affectedRows === 0) {
    throw new Error("No se pudo insertar el comprobante en la base de datos");
  }

  return {
    ComprobanteId,
    PedidoClienteId,
    RutaArchivo,
    FechaSubida: new Date(),
    Estado: "pendiente",
    Notas: null
  };
};

/**
 * Obtiene el comprobante asociado a un pedido
 */
export const getComprobanteByPedidoIdModel = async (pedidoClienteId) => {
  const connection = await connectDB();
  const query = "SELECT * FROM comprobantes_pago WHERE PedidoClienteId = ?";
  const [rows] = await connection.execute(query, [pedidoClienteId]);
  return rows.length ? rows[0] : null;
};

/**
 * Obtiene un comprobante por su ID
 */
export const getComprobanteByComprobanteIdModel = async (comprobanteId) => {
  const connection = await connectDB();
  const query = "SELECT * FROM comprobantes_pago WHERE ComprobanteId = ?";
  const [rows] = await connection.execute(query, [comprobanteId]);
  return rows.length ? rows[0] : null;
};

/**
 * Actualiza el estado de un comprobante
 */
export const updateComprobanteModel = async (comprobanteId, updateData) => {
  const { Estado, Notas } = updateData;
  const connection = await connectDB();

  const query = `
    UPDATE comprobantes_pago 
    SET Estado = ?, Notas = ? 
    WHERE ComprobanteId = ?
  `;

  const [result] = await connection.execute(query, [Estado, Notas, comprobanteId]);
  return result.affectedRows > 0;
};