// server/models/comprobante.model.js
import { v4 as uuidv4 } from "uuid";
import connection from "../lib/db.js";

/**
 * Crea un nuevo comprobante de pago
 * @param {Object} comprobanteData - { PedidoClienteId (CHAR(36)), RutaArchivo (string) }
 * @returns {Object} Comprobante creado con ComprobanteId (UUID)
 */
export const createComprobanteModel = async (comprobanteData) => {
  const { PedidoClienteId, RutaArchivo } = comprobanteData;
  const ComprobanteId = uuidv4();

  const query = `
    INSERT INTO comprobantes_pago 
    (ComprobanteId, PedidoClienteId, RutaArchivo) 
    VALUES (?, ?, ?)
  `;

  await connection.promise().execute(query, [ComprobanteId, PedidoClienteId, RutaArchivo]);

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
 * Obtiene el comprobante asociado a un pedido (por PedidoClienteId = UUID)
 */
export const getComprobanteByPedidoIdModel = async (pedidoClienteId) => {
  const query = "SELECT * FROM comprobantes_pago WHERE PedidoClienteId = ?";
  const [rows] = await connection.promise().execute(query, [pedidoClienteId]);
  return rows.length ? rows[0] : null;
};

/**
 * Obtiene un comprobante por su ComprobanteId (UUID)
 */
export const getComprobanteByComprobanteIdModel = async (comprobanteId) => {
  const query = "SELECT * FROM comprobantes_pago WHERE ComprobanteId = ?";
  const [rows] = await connection.promise().execute(query, [comprobanteId]);
  return rows.length ? rows[0] : null;
};

/**
 * Actualiza el estado de un comprobante (usado por admin)
 */
export const updateComprobanteModel = async (comprobanteId, updateData) => {
  const { Estado, Notas } = updateData;

  const query = `
    UPDATE comprobantes_pago 
    SET Estado = ?, Notas = ? 
    WHERE ComprobanteId = ?
  `;

  const [result] = await connection.promise().execute(query, [Estado, Notas, comprobanteId]);
  return result.affectedRows > 0;
};